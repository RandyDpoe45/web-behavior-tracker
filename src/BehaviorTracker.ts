import { BehaviorEvent, BehaviorMetrics, BehaviorInsights, TrackingOptions, FormField } from './types.js';

export class BehaviorTracker {
  private events: BehaviorEvent[] = [];
  private startTime: number = 0;
  private options: TrackingOptions;
  private formFields: Map<string, FormField> = new Map();
  private isTracking: boolean = false;
  private sessionId: string;
  private static readonly STORAGE_KEY = 'web_behavior_tracker_session';
  private debounceTimers: Map<string, number> = new Map();
  private lastInputValues: Map<string, string> = new Map();
  private static readonly THROTTLE_DELAY = 100; // 100ms throttle delay
  private lastThrottledEvent: number = 0;

  constructor(options: TrackingOptions = {}) {
    // Ensure options are properly initialized with defaults
    this.options = {
      trackMouseMovements: false,
      trackFocusBlur: true,
      trackInputChanges: true,
      trackClicks: true,
      customEvents: [],
      riskThreshold: 0.7,
      minTimeSpent: 5000,
      maxTimeSpent: 300000,
      ...options
    };
    
    this.sessionId = this.getOrCreateSessionId();
    this.loadSessionData();
  }

  private getOrCreateSessionId(): string {
    const existingSession = sessionStorage.getItem(BehaviorTracker.STORAGE_KEY);
    if (existingSession) {
      const { sessionId } = JSON.parse(existingSession);
      return sessionId;
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.saveSessionData({ sessionId: newSessionId, events: [] });
    return newSessionId;
  }

  private saveSessionData(data: { sessionId: string; events: BehaviorEvent[] }): void {
    sessionStorage.setItem(BehaviorTracker.STORAGE_KEY, JSON.stringify(data));
  }

  private loadSessionData(): void {
    const existingSession = sessionStorage.getItem(BehaviorTracker.STORAGE_KEY);
    if (existingSession) {
      const { events } = JSON.parse(existingSession);
      this.events = events;
    }
  }

  public startTracking(): void {
    if (this.isTracking) return;
    this.clearSession();
    
    this.isTracking = true;
    this.startTime = Date.now();
    this.setupEventListeners();
    this.setupPageUnloadHandler();
  }

  public stopTracking(): void {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    this.removeEventListeners();
    this.removePageUnloadHandler();
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
    
    // Clear all debounce timers
    this.debounceTimers.forEach(timerId => {
      window.clearTimeout(timerId);
    });
    this.debounceTimers.clear();
    this.lastInputValues.clear();
  }

  private setupPageUnloadHandler(): void {
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
  }

  private removePageUnloadHandler(): void {
    window.removeEventListener('beforeunload', this.handlePageUnload.bind(this));
  }

  private handlePageUnload(): void {
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  public getMetrics(): BehaviorMetrics {
    const currentTime = Date.now();
    const timeSpent = currentTime - this.startTime;

    const metrics: BehaviorMetrics = {
      timeSpent,
      fieldInteractions: 0,
      fieldChanges: 0,
      focusCount: 0,
      blurCount: 0,
      mouseInteractions: 0
    };

    this.events.forEach(event => {
      switch (event.type) {
        case 'focus':
          metrics.focusCount++;
          metrics.fieldInteractions++;
          break;
        case 'blur':
          metrics.blurCount++;
          metrics.fieldInteractions++;
          break;
        case 'input':
        case 'change':
          metrics.fieldChanges++;
          metrics.fieldInteractions++;
          break;
        case 'mouseover':
        case 'mouseout':
          metrics.mouseInteractions++;
          break;
      }
    });

    return metrics;
  }

  public getInsights(): BehaviorInsights {
    const metrics = this.getMetrics();
    const fieldInteractionOrder = this.getFieldInteractionOrder();
    const suspiciousPatterns = this.detectSuspiciousPatterns();
    const riskScore = this.calculateRiskScore(metrics, suspiciousPatterns);

    return {
      riskScore,
      suspiciousPatterns,
      completionRate: this.calculateCompletionRate(),
      averageTimePerField: metrics.timeSpent / (metrics.fieldInteractions || 1),
      fieldInteractionOrder
    };
  }

  public getEvents(): BehaviorEvent[] {
    return [...this.events];
  }

  private setupEventListeners(): void {
    // Remove any existing listeners first
    this.removeEventListeners();

    // Only track meaningful form events
    const formEvents: string[] = [];

    // Add events based on options
    if (this.options.trackFocusBlur) {
      formEvents.push('focus', 'blur');
    }
    if (this.options.trackInputChanges) {
      formEvents.push('change', 'onchange', 'oninput');
    }
    if (this.options.trackClicks) {
      formEvents.push('click');
    }
    if (this.options.trackMouseMovements) {
      formEvents.push('mouseover', 'mouseout');
    }

    // Always track these events as they're essential for form functionality
    formEvents.push('invalid', 'reset', 'submit');

    // Track events on all form elements
    const formElements = [
      'input',
      'select',
      'textarea',
      'button',
      'fieldset',
      'form',
      'label',
      'optgroup',
      'option'
    ];

    // Add event listeners for each form element type
    formElements.forEach(_ => {
      formEvents.forEach(eventType => {
        document.addEventListener(eventType, this.handleEvent.bind(this), true);
      });
    });

    // Special handling for input events with debouncing
    if (this.options.trackInputChanges) {
      document.addEventListener('input', this.handleInputEvent.bind(this), true);
    }

    // Special handling for select elements
    document.addEventListener('change', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'select') {
        this.handleSelectChange(event);
      }
    }, true);

    // Special handling for checkboxes and radio buttons
    document.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.type === 'checkbox' || target.type === 'radio') {
        this.handleCheckboxRadioChange(event);
      }
    }, true);

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      if (target.tagName.toLowerCase() === 'form') {
        this.handleFormSubmit(event);
      }
    }, true);
  }

  private removeEventListeners(): void {
    const events = [
      'focus',
      'blur',
      'change',
      'click',
      'mouseover',
      'mouseout',
      'input',
      'invalid',
      'reset',
      'submit'
    ];

    events.forEach(eventType => {
      document.removeEventListener(eventType, this.handleEvent.bind(this), true);
    });

    document.removeEventListener('input', this.handleInputEvent.bind(this), true);
  }

  private handleInputEvent(event: Event): void {
    if (!this.isTracking || !this.options.trackInputChanges) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Get the current value
    let elementValue: string | boolean | string[] | null = null;
    
    if (target instanceof HTMLInputElement) {
      if (target.type === 'checkbox') {
        elementValue = target.checked;
      } else if (target.type === 'radio') {
        elementValue = target.checked ? target.value : null;
      } else {
        elementValue = target.value;
      }
    } else if (target instanceof HTMLSelectElement) {
      if (target.multiple) {
        elementValue = Array.from(target.selectedOptions).map(option => option.value);
      } else {
        elementValue = target.value;
      }
    } else if (target instanceof HTMLTextAreaElement) {
      elementValue = target.value;
    }

    // For custom elements, try to get value from data attributes or aria attributes
    if (elementValue === null) {
      elementValue = target.getAttribute('data-value') || 
                    target.getAttribute('aria-valuetext') || 
                    target.getAttribute('value') || 
                    target.textContent || 
                    '';
    }

    const elementState = this.getElementState(target);

    const behaviorEvent: BehaviorEvent = {
      type: 'input',
      elementId: target.id || '',
      elementType: target.tagName.toLowerCase(),
      timestamp: Date.now(),
      value: elementValue,
      pageUrl: window.location.pathname,
      elementAttributes: this.getElementAttributes(target),
      elementState
    };

    this.events.push(behaviorEvent);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  private handleEvent(event: Event): void {
    if (!this.isTracking) return;

    // Ignore keyboard events
    if (event instanceof KeyboardEvent) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = this.isFormElement(target);
    if (!isFormElement) return;

    // Check if we should track this event type based on options
    if (event.type === 'mouseover' || event.type === 'mouseout') {
      if (!this.options.trackMouseMovements) {
        return;
      }
    }

    if (event.type === 'click' && !this.options.trackClicks) {
      return;
    }

    if ((event.type === 'focus' || event.type === 'blur') && !this.options.trackFocusBlur) {
      return;
    }

    // Throttle events
    const now = Date.now();
    if (now - this.lastThrottledEvent < BehaviorTracker.THROTTLE_DELAY) {
      return;
    }
    this.lastThrottledEvent = now;

    const elementValue = this.getElementValue(target);
    const elementState = this.getElementState(target);

    const behaviorEvent: BehaviorEvent = {
      type: event.type as BehaviorEvent['type'],
      elementId: target.id || '',
      elementType: target.tagName.toLowerCase(),
      timestamp: now,
      value: elementValue,
      pageUrl: window.location.pathname,
      elementAttributes: this.getElementAttributes(target),
      elementState
    };

    this.events.push(behaviorEvent);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  private isFormElement(element: HTMLElement): boolean {
    const formElements = [
      'input',
      'select',
      'textarea',
      'button',
      'fieldset',
      'form',
      'label',
      'optgroup',
      'option'
    ];

    // Check if element is a form element
    if (formElements.includes(element.tagName.toLowerCase())) {
      return true;
    }

    // Check if element has a form-related role
    const role = element.getAttribute('role');
    const formRoles = [
      'textbox',
      'checkbox',
      'radio',
      'combobox',
      'listbox',
      'button',
      'slider',
      'spinbutton'
    ];

    return role ? formRoles.includes(role) : false;
  }

  private getElementValue(element: HTMLElement): string {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        return element.checked.toString();
      }
      if (element.type === 'radio') {
        return element.checked ? element.value : '';
      }
      return element.value;
    }

    if (element instanceof HTMLSelectElement) {
      if (element.multiple) {
        return Array.from(element.selectedOptions).map(opt => opt.value).join(',');
      }
      return element.value;
    }

    if (element instanceof HTMLTextAreaElement) {
      return element.value;
    }

    // For custom elements, try multiple approaches to get the value
    const customValue = 
      element.getAttribute('data-value') ||
      element.getAttribute('aria-valuetext') ||
      element.getAttribute('value') ||
      element.textContent?.trim() ||
      '';

    // If the element has a role of combobox or listbox, try to get the selected option
    if (element.getAttribute('role') === 'combobox' || element.getAttribute('role') === 'listbox') {
      const selectedOption = element.querySelector('[aria-selected="true"]');
      if (selectedOption) {
        return selectedOption.textContent?.trim() || customValue;
      }
    }

    return customValue;
  }

  private getElementAttributes(element: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    const relevantAttributes = [
      'type',
      'name',
      'required',
      'disabled',
      'readonly',
      'placeholder',
      'min',
      'max',
      'step',
      'pattern',
      'autocomplete',
      'role',
      'aria-label',
      'aria-required'
    ];

    relevantAttributes.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value !== null) {
        attributes[attr] = value;
      }
    });

    return attributes;
  }

  private handleSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (!target) return;

    const selectedOptions = Array.from(target.options).map(option => ({
      value: option.value,
      text: option.text,
      selected: option.selected
    }));

    const behaviorEvent: BehaviorEvent = {
      type: 'select-change',
      elementId: target.id || '',
      elementType: 'select',
      timestamp: Date.now(),
      value: target.value,
      pageUrl: window.location.pathname,
      elementAttributes: this.getElementAttributes(target),
      elementState: this.getElementState(target),
      selectedOptions
    };

    this.events.push(behaviorEvent);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  private handleCheckboxRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const behaviorEvent: BehaviorEvent = {
      type: 'checkbox-radio-change',
      elementId: target.id || '',
      elementType: target.type,
      timestamp: Date.now(),
      value: target.checked.toString(),
      pageUrl: window.location.pathname,
      elementAttributes: this.getElementAttributes(target)
    };

    this.events.push(behaviorEvent);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  private handleFormSubmit(event: Event): void {
    const target = event.target as HTMLFormElement;
    const formData = new FormData(target);
    const formValues: Record<string, string> = {};

    formData.forEach((value, key) => {
      formValues[key] = value.toString();
    });

    const behaviorEvent: BehaviorEvent = {
      type: 'form-submit',
      elementId: target.id || '',
      elementType: 'form',
      timestamp: Date.now(),
      value: JSON.stringify(formValues),
      pageUrl: window.location.pathname,
      elementAttributes: this.getElementAttributes(target)
    };

    this.events.push(behaviorEvent);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  private getFieldInteractionOrder(): string[] {
    const uniqueFields = new Set<string>();
    return this.events
      .filter(event => ['focus', 'input', 'change'].includes(event.type))
      .map(event => event.elementId)
      .filter(id => {
        if (uniqueFields.has(id)) return false;
        uniqueFields.add(id);
        return true;
      });
  }

  private detectSuspiciousPatterns(): string[] {
    const patterns: string[] = [];
    const metrics = this.getMetrics();

    // Detect rapid form filling
    if (metrics.timeSpent < 5000 && metrics.fieldChanges > 5) {
      patterns.push('Rapid form filling detected');
    }

    // Detect unusual focus patterns
    if (metrics.focusCount > 20 && metrics.timeSpent < 10000) {
      patterns.push('Unusual focus pattern detected');
    }

    // Detect copy-paste behavior
    const inputEvents = this.events.filter(e => e.type === 'input');
    const rapidInputs = inputEvents.filter((event, index) => {
      if (index === 0) return false;
      return event.timestamp - inputEvents[index - 1].timestamp < 50;
    });

    if (rapidInputs.length > 3) {
      patterns.push('Possible copy-paste behavior detected');
    }

    return patterns;
  }

  private calculateRiskScore(metrics: BehaviorMetrics, suspiciousPatterns: string[]): number {
    let score = 0;

    // Time-based risk
    if (metrics.timeSpent < this.options.minTimeSpent!) score += 0.3;
    if (metrics.timeSpent > this.options.maxTimeSpent!) score += 0.2;

    // Interaction-based risk
    if (metrics.fieldChanges / metrics.fieldInteractions > 0.8) score += 0.2;
    if (metrics.mouseInteractions < 5) score += 0.1;

    // Pattern-based risk
    score += suspiciousPatterns.length * 0.1;

    return Math.min(score, 1);
  }

  private calculateCompletionRate(): number {
    const requiredFields = Array.from(this.formFields.values()).filter(field => field.isRequired);
    if (requiredFields.length === 0) return 1;

    const completedFields = requiredFields.filter(field => {
      const fieldEvents = this.events.filter(e => e.elementId === field.id);
      return fieldEvents.some(e => e.type === 'change' || e.type === 'input');
    });

    return completedFields.length / requiredFields.length;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public clearSession(): void {
    this.events = [];
    this.startTime = Date.now();
    sessionStorage.removeItem(BehaviorTracker.STORAGE_KEY);
    this.sessionId = this.getOrCreateSessionId();
  }

  private getElementState(element: HTMLElement): Record<string, any> {
    const state: Record<string, any> = {};

    if (element instanceof HTMLInputElement) {
      state.checked = element.checked;
      state.disabled = element.disabled;
      state.readOnly = element.readOnly;
      state.required = element.required;
      state.valid = element.validity.valid;
      state.validationMessage = element.validationMessage;
    }

    if (element instanceof HTMLSelectElement) {
      state.disabled = element.disabled;
      state.required = element.required;
      state.selectedIndex = element.selectedIndex;
      state.selectedOptions = Array.from(element.selectedOptions).map(option => ({
        value: option.value,
        text: option.text,
        index: option.index
      }));
    }

    if (element instanceof HTMLTextAreaElement) {
      state.disabled = element.disabled;
      state.readOnly = element.readOnly;
      state.required = element.required;
      state.valid = element.validity.valid;
      state.validationMessage = element.validationMessage;
    }

    return state;
  }
} 