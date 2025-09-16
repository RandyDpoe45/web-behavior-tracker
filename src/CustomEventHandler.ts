import { BehaviorEvent, TrackingOptions } from './types.js';
import { TrackingUtils } from './utils.js';

/**
 * Handles custom events that can be manually triggered by the application
 */
export class CustomEventHandler {
  private options: TrackingOptions;
  private customEvents: BehaviorEvent[] = [];

  constructor(options: TrackingOptions) {
    this.options = options;
  }

  /**
   * Creates and logs a custom event
   */
  createCustomEvent(
    eventName: string,
    customData: Record<string, any>,
    target: HTMLElement | undefined,
    onEventCreated: (event: BehaviorEvent) => void
  ): BehaviorEvent {
    const eventTarget = target || document.body;
    
    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      'custom' as any, // We'll need to add 'custom' to the BehaviorEvent type
      eventTarget,
      JSON.stringify(customData),
      {
        customEventName: eventName,
        customData: customData,
        timestamp: Date.now()
      }
    );

    // Override the type to be the custom event name
    behaviorEvent.type = eventName as any;

    // Add to custom events list
    this.customEvents.push(behaviorEvent);

    // Notify the main tracker
    onEventCreated(behaviorEvent);

    return behaviorEvent;
  }

  /**
   * Gets all custom events
   */
  getCustomEvents(): BehaviorEvent[] {
    return [...this.customEvents];
  }

  /**
   * Gets custom events by name
   */
  getCustomEventsByName(eventName: string): BehaviorEvent[] {
    return this.customEvents.filter(event => 
      (event as any).customEventName === eventName
    );
  }

  /**
   * Gets custom events count
   */
  getCustomEventsCount(): number {
    return this.customEvents.length;
  }

  /**
   * Gets custom events count by name
   */
  getCustomEventsCountByName(eventName: string): number {
    return this.getCustomEventsByName(eventName).length;
  }

  /**
   * Clears all custom events
   */
  clearCustomEvents(): void {
    this.customEvents = [];
  }

  /**
   * Gets custom events statistics
   */
  getCustomEventsStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.customEvents.forEach(event => {
      const eventName = (event as any).customEventName;
      if (eventName) {
        stats[eventName] = (stats[eventName] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Gets recent custom events (last N events)
   */
  getRecentCustomEvents(count: number = 10): BehaviorEvent[] {
    return this.customEvents
      .slice(-count)
      .reverse(); // Most recent first
  }

  /**
   * Checks if a custom event has been triggered
   */
  hasCustomEvent(eventName: string): boolean {
    return this.customEvents.some(event => 
      (event as any).customEventName === eventName
    );
  }

  /**
   * Gets the last occurrence of a custom event
   */
  getLastCustomEvent(eventName?: string): BehaviorEvent | null {
    const events = eventName 
      ? this.getCustomEventsByName(eventName)
      : this.customEvents;
    
    return events.length > 0 ? events[events.length - 1] : null;
  }
}
