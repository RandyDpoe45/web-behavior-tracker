import { BehaviorEvent, TrackingOptions } from './types.js';
import { TrackingUtils } from './utils.js';

/**
 * Handles input events including typing, deleting, and autocomplete detection
 */
export class InputEventHandler {
  private lastInputValues: Map<string, string> = new Map();
  private lastInputTimes: Map<string, number> = new Map();
  private options: TrackingOptions;

  constructor(options: TrackingOptions) {
    this.options = options;
  }

  /**
   * Handles input events and determines if they are input, delete, or autocomplete
   */
  handleInputEvent(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    if (!this.options.trackInputChanges) return;

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

    const elementId = target.id || '';
    const currentValue = String(elementValue || '');
    const previousValue = this.lastInputValues.get(elementId) || '';
    const currentTime = Date.now();
    const lastInputTime = this.lastInputTimes.get(elementId) || 0;

    // Determine the type of input event
    let eventType: 'input' | 'delete' | 'autocomplete' = 'input';
    
    if (currentValue.length < previousValue.length) {
      eventType = 'delete';
    } else if (TrackingUtils.isAutocompleteEvent(currentValue, previousValue, currentTime, lastInputTime, target)) {
      eventType = 'autocomplete';
    }

    // Create the behavior event
    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      eventType,
      target,
      elementValue
    );

    onEventCreated(behaviorEvent);
    
    // Update the last known value and time for this element
    this.lastInputValues.set(elementId, currentValue);
    this.lastInputTimes.set(elementId, currentTime);
  }

  /**
   * Clears stored input values and times
   */
  clear(): void {
    this.lastInputValues.clear();
    this.lastInputTimes.clear();
  }

  /**
   * Gets the last known value for an element
   */
  getLastValue(elementId: string): string {
    return this.lastInputValues.get(elementId) || '';
  }

  /**
   * Gets the last input time for an element
   */
  getLastInputTime(elementId: string): number {
    return this.lastInputTimes.get(elementId) || 0;
  }
}
