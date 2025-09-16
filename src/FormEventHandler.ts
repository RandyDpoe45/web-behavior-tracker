import { BehaviorEvent, TrackingOptions } from './types.js';
import { TrackingUtils } from './utils.js';

/**
 * Handles form-specific events like select changes, checkbox/radio changes, and form submissions
 */
export class FormEventHandler {
  private options: TrackingOptions;

  constructor(options: TrackingOptions) {
    this.options = options;
  }

  /**
   * Handles select element changes
   */
  handleSelectChange(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    const target = event.target as HTMLSelectElement;
    if (!target) return;

    const selectedOptions = Array.from(target.options).map(option => ({
      value: option.value,
      text: option.text,
      selected: option.selected
    }));

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'select-change',
      target,
      target.value,
      { selectedOptions }
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles checkbox and radio button changes
   */
  handleCheckboxRadioChange(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    const target = event.target as HTMLInputElement;
    
    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'checkbox-radio-change',
      target,
      target.checked.toString()
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles form submission events
   */
  handleFormSubmit(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    const target = event.target as HTMLFormElement;
    const formData = new FormData(target);
    const formValues: Record<string, string> = {};

    formData.forEach((value, key) => {
      formValues[key] = value.toString();
    });

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'form-submit',
      target,
      JSON.stringify(formValues)
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles form validation events
   */
  handleFormValidation(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    const target = event.target as HTMLElement;
    
    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'invalid',
      target,
      TrackingUtils.getElementValue(target)
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles form reset events
   */
  handleFormReset(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    const target = event.target as HTMLElement;
    
    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'reset',
      target,
      TrackingUtils.getElementValue(target)
    );

    onEventCreated(behaviorEvent);
  }
}
