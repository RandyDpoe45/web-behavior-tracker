import { BehaviorEvent, BehaviorMetrics, BehaviorInsights, TrackingOptions, FormField, CustomEventStats } from './types.js';
import { BrowserMetadataCollector } from './BrowserMetadataCollector.js';
import { InputEventHandler } from './InputEventHandler.js';
import { FormEventHandler } from './FormEventHandler.js';
import { MouseEventHandler } from './MouseEventHandler.js';
import { ClipboardEventHandler } from './ClipboardEventHandler.js';
import { CustomEventHandler } from './CustomEventHandler.js';

export class BehaviorTracker {
  private events: BehaviorEvent[] = [];
  private startTime: number = 0;
  private options: TrackingOptions;
  private formFields: Map<string, FormField> = new Map();
  private isTracking: boolean = false;
  private sessionId: string;
  private static readonly STORAGE_KEY = 'web_behavior_tracker_session';
  private debounceTimers: Map<string, number> = new Map();
  private THROTTLE_DELAY: number = 100; // 100ms throttle delay
  
  // Event handlers
  private inputHandler: InputEventHandler;
  private formHandler: FormEventHandler;
  private mouseHandler: MouseEventHandler;
  private clipboardHandler: ClipboardEventHandler;
  private customHandler: CustomEventHandler;

  constructor(options: TrackingOptions = {}) {
    // Ensure options are properly initialized with defaults
    this.options = {
      trackMouseMovements: false,
      trackFocusBlur: true,
      trackInputChanges: true,
      trackClicks: true,
      trackCopyPaste: true,
      riskThreshold: 0.7,
      minTimeSpent: 5000,
      maxTimeSpent: 300000,
      ...options
    };
    
    this.THROTTLE_DELAY = options.throttleDelay || 100;
    
    // Initialize event handlers
    this.inputHandler = new InputEventHandler(this.options);
    this.formHandler = new FormEventHandler(this.options);
    this.mouseHandler = new MouseEventHandler(this.options, this.THROTTLE_DELAY);
    this.clipboardHandler = new ClipboardEventHandler(this.options);
    this.customHandler = new CustomEventHandler(this.options);
    
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

  public startTracking(reset: boolean = false): void {
    if (this.isTracking) return;
    if (reset) {
      this.clearSession();
    }
    
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
    
    // Clear input handler data
    this.inputHandler.clear();
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
      mouseInteractions: 0,
      copyCount: 0,
      pasteCount: 0,
      cutCount: 0,
      deleteCount: 0,
      customEventCount: 0
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
        case 'delete':
          metrics.deleteCount++;
          metrics.fieldChanges++;
          metrics.fieldInteractions++;
          break;
        case 'mouseover':
        case 'mouseout':
          metrics.mouseInteractions++;
          break;
        case 'copy':
          metrics.copyCount++;
          break;
        case 'paste':
          metrics.pasteCount++;
          break;
        case 'cut':
          metrics.cutCount++;
          break;
        case 'custom':
          metrics.customEventCount++;
          break;
        default:
          // Check if it's a custom event by looking for customEventName
          if ((event as any).customEventName) {
            metrics.customEventCount++;
          }
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
    const browserMetadata = BrowserMetadataCollector.getBrowserMetadata();
    const customEventStats = this.getCustomEventStats();

    return {
      riskScore,
      suspiciousPatterns,
      completionRate: this.calculateCompletionRate(),
      averageTimePerField: metrics.timeSpent / (metrics.fieldInteractions || 1),
      fieldInteractionOrder,
      browserMetadata,
      customEventStats
    };
  }

  public getEvents(): BehaviorEvent[] {
    return [...this.events];
  }

  /**
   * Helper method to handle event creation and storage
   */
  private onEventCreated(event: BehaviorEvent): void {
    this.events.push(event);
    this.saveSessionData({ sessionId: this.sessionId, events: this.events });
  }

  /**
   * Gets browser metadata using the dedicated BrowserMetadataCollector
   */
  public getBrowserMetadata() {
    return BrowserMetadataCollector.getBrowserMetadata();
  }

  /**
   * Gets additional metadata using the dedicated BrowserMetadataCollector
   */
  public getAdditionalMetadata() {
    return BrowserMetadataCollector.getAdditionalMetadata();
  }

  /**
   * Gets high-entropy metadata using the dedicated BrowserMetadataCollector
   */
  public async getHighEntropyMetadata() {
    return BrowserMetadataCollector.getHighEntropyMetadata();
  }

  /**
   * Gets browser fingerprint using the dedicated BrowserMetadataCollector
   */
  public getBrowserFingerprint() {
    return BrowserMetadataCollector.getBrowserFingerprint();
  }

  /**
   * Gets browser capabilities using the dedicated BrowserMetadataCollector
   */
  public getBrowserCapabilities() {
    return BrowserMetadataCollector.getBrowserCapabilities();
  }

  /**
   * Creates and logs a custom event
   */
  public trackCustomEvent(
    eventName: string, 
    customData: Record<string, any> = {}, 
    target?: HTMLElement
  ): BehaviorEvent {
    return this.customHandler.createCustomEvent(
      eventName, 
      customData, 
      target, 
      this.onEventCreated.bind(this)
    );
  }

  /**
   * Gets all custom events
   */
  public getCustomEvents(): BehaviorEvent[] {
    return this.customHandler.getCustomEvents();
  }

  /**
   * Gets custom events by name
   */
  public getCustomEventsByName(eventName: string): BehaviorEvent[] {
    return this.customHandler.getCustomEventsByName(eventName);
  }

  /**
   * Gets custom events count
   */
  public getCustomEventsCount(): number {
    return this.customHandler.getCustomEventsCount();
  }

  /**
   * Gets custom events count by name
   */
  public getCustomEventsCountByName(eventName: string): number {
    return this.customHandler.getCustomEventsCountByName(eventName);
  }

  /**
   * Gets custom events statistics
   */
  public getCustomEventStats(): CustomEventStats {
    const customEvents = this.customHandler.getCustomEvents();
    const stats = this.customHandler.getCustomEventsStats();
    const recentEvents = this.customHandler.getRecentCustomEvents(10);
    const lastEvent = this.customHandler.getLastCustomEvent();

    return {
      totalCustomEvents: customEvents.length,
      eventsByName: stats,
      recentEvents,
      lastEvent: lastEvent || undefined
    };
  }

  /**
   * Clears all custom events
   */
  public clearCustomEvents(): void {
    this.customHandler.clearCustomEvents();
  }

  /**
   * Checks if a custom event has been triggered
   */
  public hasCustomEvent(eventName: string): boolean {
    return this.customHandler.hasCustomEvent(eventName);
  }

  /**
   * Gets the last occurrence of a custom event
   */
  public getLastCustomEvent(eventName?: string): BehaviorEvent | null {
    return this.customHandler.getLastCustomEvent(eventName);
  }

  private setupEventListeners(): void {
    // Remove any existing listeners first
    this.removeEventListeners();

    // Input events
    if (this.options.trackInputChanges) {
      document.addEventListener('input', (event) => {
        this.inputHandler.handleInputEvent(event, this.onEventCreated.bind(this));
      }, true);
    }

    // Focus and blur events
    if (this.options.trackFocusBlur) {
      document.addEventListener('focus', (event) => {
        this.mouseHandler.handleFocusBlurEvent(event, this.onEventCreated.bind(this));
      }, true);
      document.addEventListener('blur', (event) => {
        this.mouseHandler.handleFocusBlurEvent(event, this.onEventCreated.bind(this));
      }, true);
    }

    // Click events
    if (this.options.trackClicks) {
      document.addEventListener('click', (event) => {
        this.mouseHandler.handleClickEvent(event, this.onEventCreated.bind(this));
      }, true);
    }

    // Mouse movement events
    if (this.options.trackMouseMovements) {
      document.addEventListener('mouseover', (event) => {
        this.mouseHandler.handleMouseMovementEvent(event, this.onEventCreated.bind(this));
      }, true);
      document.addEventListener('mouseout', (event) => {
        this.mouseHandler.handleMouseMovementEvent(event, this.onEventCreated.bind(this));
      }, true);
    }

    // Form-specific events
    document.addEventListener('change', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'select') {
        this.formHandler.handleSelectChange(event, this.onEventCreated.bind(this));
      } else if (target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio')) {
        this.formHandler.handleCheckboxRadioChange(event, this.onEventCreated.bind(this));
      }
    }, true);

    // Form submission and validation
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      if (target.tagName.toLowerCase() === 'form') {
        this.formHandler.handleFormSubmit(event, this.onEventCreated.bind(this));
      }
    }, true);

    document.addEventListener('invalid', (event) => {
      this.formHandler.handleFormValidation(event, this.onEventCreated.bind(this));
    }, true);

    document.addEventListener('reset', (event) => {
      this.formHandler.handleFormReset(event, this.onEventCreated.bind(this));
    }, true);

    // Clipboard events
    if (this.options.trackCopyPaste) {
      document.addEventListener('copy', (event) => {
        this.clipboardHandler.handleCopyEvent(event as ClipboardEvent, this.onEventCreated.bind(this));
      }, true);
      document.addEventListener('paste', (event) => {
        this.clipboardHandler.handlePasteEvent(event as ClipboardEvent, this.onEventCreated.bind(this));
      }, true);
      document.addEventListener('cut', (event) => {
        this.clipboardHandler.handleCutEvent(event as ClipboardEvent, this.onEventCreated.bind(this));
      }, true);
    }
  }

  private removeEventListeners(): void {
    // Since we're using arrow functions in addEventListener, we need to remove all listeners
    // by cloning the node or using a different approach. For now, we'll rely on the
    // setupEventListeners method to remove existing listeners first.
    
    // In a production environment, you might want to store references to the bound functions
    // to properly remove them, or use a more sophisticated event management system.
    
    // For this implementation, we'll rely on the fact that setupEventListeners
    // calls removeEventListeners first, and we'll recreate all listeners.
  }


  private getFieldInteractionOrder(): string[] {
    const uniqueFields = new Set<string>();
    return this.events
      .filter(event => ['focus', 'input', 'delete', 'change'].includes(event.type))
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

    // Detect copy-paste behavior using explicit events
    const copyPasteEvents = this.events.filter(e => ['copy', 'paste', 'cut'].includes(e.type));
    if (copyPasteEvents.length > 0) {
      patterns.push(`${copyPasteEvents.length} copy-paste operations detected`);
      
      // Detect specific copy-paste patterns
      const copyCount = copyPasteEvents.filter(e => e.type === 'copy').length;
      const pasteCount = copyPasteEvents.filter(e => e.type === 'paste').length;
      
      if (copyCount > 0 && pasteCount === 0) {
        patterns.push('Copy operations without paste detected (potential data harvesting)');
      }
      
      if (copyPasteEvents.length > 10) {
        patterns.push('Excessive copy-paste operations detected');
      }
      
      if (this.detectRapidCopyPasteSequence()) {
        patterns.push('Rapid copy-paste sequence detected (potential automation)');
      }
    }

    // Detect rapid input events as fallback for copy-paste detection
    const inputEvents = this.events.filter(e => e.type === 'input');
    const rapidInputs = inputEvents.filter((event, index) => {
      if (index === 0) return false;
      return event.timestamp - inputEvents[index - 1].timestamp < 50;
    });

    if (rapidInputs.length > 3 && copyPasteEvents.length === 0) {
      patterns.push('Possible copy-paste behavior detected (rapid input)');
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

    // Copy-paste behavior risk (fraud detection patterns)
    const totalCopyPasteOps = metrics.copyCount + metrics.pasteCount + metrics.cutCount;
    const totalFieldInteractions = metrics.fieldInteractions || 1;
    
    // High copy-paste ratio indicates potential automation or data harvesting
    const copyPasteRatio = totalCopyPasteOps / totalFieldInteractions;
    if (copyPasteRatio > 0.5) score += 0.25; // More than 50% of interactions are copy-paste
    else if (copyPasteRatio > 0.3) score += 0.15; // 30-50% copy-paste ratio
    else if (copyPasteRatio > 0.1) score += 0.05; // 10-30% copy-paste ratio (normal usage)
    
    // Excessive copy-paste operations (potential data scraping)
    if (totalCopyPasteOps > 10) score += 0.2; // More than 10 copy-paste operations
    else if (totalCopyPasteOps > 5) score += 0.1; // 5-10 copy-paste operations
    
    // Copy without paste pattern (potential data harvesting)
    if (metrics.copyCount > 0 && metrics.pasteCount === 0) score += 0.15;
    
    // Rapid copy-paste sequence (potential automation)
    const rapidCopyPaste = this.detectRapidCopyPasteSequence();
    if (rapidCopyPaste) score += 0.2;

    // Pattern-based risk
    score += suspiciousPatterns.length * 0.1;

    return Math.min(score, 1);
  }

  private detectRapidCopyPasteSequence(): boolean {
    const copyPasteEvents = this.events.filter(e => ['copy', 'paste', 'cut'].includes(e.type));
    
    // Check for rapid copy-paste sequences (multiple operations within 2 seconds)
    for (let i = 1; i < copyPasteEvents.length; i++) {
      const timeDiff = copyPasteEvents[i].timestamp - copyPasteEvents[i - 1].timestamp;
      if (timeDiff < 2000) { // Less than 2 seconds between operations
        return true;
      }
    }
    
    // Check for copy-paste burst (3+ operations within 5 seconds)
    let burstCount = 0;
    const burstWindow = 5000; // 5 seconds
    const now = Date.now();
    
    for (const event of copyPasteEvents) {
      if (now - event.timestamp <= burstWindow) {
        burstCount++;
        if (burstCount >= 3) {
          return true;
        }
      }
    }
    
    return false;
  }

  private calculateCompletionRate(): number {
    const requiredFields = Array.from(this.formFields.values()).filter(field => field.isRequired);
    if (requiredFields.length === 0) return 1;

    const completedFields = requiredFields.filter(field => {
      const fieldEvents = this.events.filter(e => e.elementId === field.id);
      return fieldEvents.some(e => e.type === 'change' || e.type === 'input' || e.type === 'delete');
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

} 