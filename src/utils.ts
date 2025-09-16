import { BehaviorEvent, ElementState } from './types.js';

/**
 * Utility functions for behavior tracking
 */
export class TrackingUtils {
  /**
   * Checks if an element is a form element or has a form-related role
   */
  static isFormElement(element: HTMLElement): boolean {
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

  /**
   * Gets the current value of an element
   */
  static getElementValue(element: HTMLElement): string {
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

  /**
   * Gets element attributes that are relevant for tracking
   */
  static getElementAttributes(element: HTMLElement): Record<string, string> {
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

  /**
   * Gets the current state of an element
   */
  static getElementState(element: HTMLElement): ElementState {
    const state: ElementState = {};

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

  /**
   * Gets the DOM path of an element for identification
   */
  static getElementPath(element: HTMLElement): string {
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

  /**
   * Creates a behavior event with common properties
   */
  static createBehaviorEvent(
    type: BehaviorEvent['type'],
    target: HTMLElement,
    value?: any,
    additionalData?: Record<string, any>
  ): BehaviorEvent {
    return {
      type,
      elementId: target.id || '',
      elementType: target.tagName.toLowerCase(),
      timestamp: Date.now(),
      value: value !== undefined ? value : TrackingUtils.getElementValue(target),
      pageUrl: window.location.pathname,
      elementAttributes: TrackingUtils.getElementAttributes(target),
      elementState: TrackingUtils.getElementState(target),
      ...additionalData
    };
  }

  /**
   * Throttles function calls to prevent excessive execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * Debounces function calls to delay execution until after calls have stopped
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Checks if an event should be tracked based on options
   */
  static shouldTrackEvent(
    eventType: string,
    options: {
      trackMouseMovements?: boolean;
      trackFocusBlur?: boolean;
      trackClicks?: boolean;
      trackInputChanges?: boolean;
    }
  ): boolean {
    switch (eventType) {
      case 'mouseover':
      case 'mouseout':
        return options.trackMouseMovements || false;
      case 'focus':
      case 'blur':
        return options.trackFocusBlur || false;
      case 'click':
        return options.trackClicks || false;
      case 'input':
      case 'change':
        return options.trackInputChanges || false;
      default:
        return true; // Always track other events
    }
  }

  /**
   * Detects if input is likely from autocomplete
   */
  static isAutocompleteEvent(
    currentValue: string,
    previousValue: string,
    currentTime: number,
    lastInputTime: number,
    target: HTMLElement
  ): boolean {
    // Skip if this is a delete operation
    if (currentValue.length < previousValue.length) {
      return false;
    }

    // Skip if no previous value (first input)
    if (!previousValue) {
      return false;
    }

    // Check for rapid input that suggests autocomplete
    const timeDiff = currentTime - lastInputTime;
    const valueDiff = currentValue.length - previousValue.length;
    
    // Autocomplete characteristics:
    // 1. Large amount of text added quickly (more than 3 characters in < 100ms)
    // 2. Text appears to be a complete word/phrase (not gradual typing)
    // 3. Common autocomplete fields (email, name, address, etc.)
    const isRapidLargeInput = timeDiff < 100 && valueDiff > 3;
    const isCompleteWord = this.isCompleteWordInput(currentValue, previousValue);
    const isAutocompleteField = this.isAutocompleteField(target);
    
    // Additional check: if the new text contains common autocomplete patterns
    const hasAutocompletePatterns = this.hasAutocompletePatterns(currentValue, previousValue);
    
    return (isRapidLargeInput && isCompleteWord) || 
           (isAutocompleteField && valueDiff > 2) || 
           hasAutocompletePatterns;
  }

  /**
   * Checks if the added text looks like a complete word/phrase
   */
  private static isCompleteWordInput(currentValue: string, previousValue: string): boolean {
    const addedText = currentValue.substring(previousValue.length);
    
    // Check if the added text looks like a complete word/phrase
    // (contains spaces, @ symbols for emails, etc.)
    return /\s/.test(addedText) || 
           addedText.includes('@') || 
           addedText.length > 5;
  }

  /**
   * Checks if the element is commonly used for autocomplete
   */
  private static isAutocompleteField(target: HTMLElement): boolean {
    const autocompleteFields = [
      'email', 'name', 'firstname', 'lastname', 'address', 'city', 'state', 
      'zipcode', 'postal', 'country', 'phone', 'company', 'organization'
    ];
    
    const fieldName = target.getAttribute('name')?.toLowerCase() || '';
    const fieldId = target.id.toLowerCase();
    const fieldType = (target as HTMLInputElement).type?.toLowerCase() || '';
    
    return autocompleteFields.some(field => 
      fieldName.includes(field) || 
      fieldId.includes(field) ||
      fieldType === 'email'
    );
  }

  /**
   * Checks if the added text matches common autocomplete patterns
   */
  private static hasAutocompletePatterns(currentValue: string, previousValue: string): boolean {
    const addedText = currentValue.substring(previousValue.length);
    
    // Common autocomplete patterns
    const patterns = [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email
      /^\d{5}(-\d{4})?$/, // US ZIP code
      /^\d{3}-\d{3}-\d{4}$/, // US phone number
      /^[A-Za-z\s]+$/, // Name (letters and spaces only)
    ];
    
    return patterns.some(pattern => pattern.test(addedText));
  }
}
