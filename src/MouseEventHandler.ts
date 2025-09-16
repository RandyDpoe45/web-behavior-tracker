import { BehaviorEvent, TrackingOptions } from './types.js';
import { TrackingUtils } from './utils.js';

/**
 * Handles mouse events like clicks, mouseover, mouseout
 */
export class MouseEventHandler {
  private options: TrackingOptions;
  private throttleDelay: number;

  constructor(options: TrackingOptions, throttleDelay: number = 100) {
    this.options = options;
    this.throttleDelay = throttleDelay;
  }

  /**
   * Handles general mouse events (clicks, mouseover, mouseout)
   */
  handleMouseEvent(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    // Ignore keyboard events
    if (event instanceof KeyboardEvent) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = TrackingUtils.isFormElement(target);
    if (!isFormElement) return;

    // Check if we should track this event type based on options
    if (!TrackingUtils.shouldTrackEvent(event.type, this.options)) {
      return;
    }

    // Throttle events
    const throttledHandler = TrackingUtils.throttle(() => {
      const elementValue = TrackingUtils.getElementValue(target);
      const elementState = TrackingUtils.getElementState(target);

      const behaviorEvent: BehaviorEvent = {
        type: event.type as BehaviorEvent['type'],
        elementId: target.id || '',
        elementType: target.tagName.toLowerCase(),
        timestamp: Date.now(),
        value: elementValue,
        pageUrl: window.location.pathname,
        elementAttributes: TrackingUtils.getElementAttributes(target),
        elementState
      };

      onEventCreated(behaviorEvent);
    }, this.throttleDelay);

    throttledHandler();
  }

  /**
   * Handles click events specifically
   */
  handleClickEvent(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    if (!this.options.trackClicks) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = TrackingUtils.isFormElement(target);
    if (!isFormElement) return;

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'click',
      target,
      TrackingUtils.getElementValue(target)
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles mouse movement events (mouseover, mouseout)
   */
  handleMouseMovementEvent(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    if (!this.options.trackMouseMovements) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = TrackingUtils.isFormElement(target);
    if (!isFormElement) return;

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      event.type as 'mouseover' | 'mouseout',
      target,
      TrackingUtils.getElementValue(target)
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles focus and blur events
   */
  handleFocusBlurEvent(event: Event, onEventCreated: (event: BehaviorEvent) => void): void {
    if (!this.options.trackFocusBlur) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = TrackingUtils.isFormElement(target);
    if (!isFormElement) return;

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      event.type as 'focus' | 'blur',
      target,
      TrackingUtils.getElementValue(target)
    );

    onEventCreated(behaviorEvent);
  }
}
