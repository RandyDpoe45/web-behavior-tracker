import { BehaviorEvent, TrackingOptions } from './types.js';
import { TrackingUtils } from './utils.js';

/**
 * Handles clipboard events like copy, paste, and cut
 */
export class ClipboardEventHandler {
  private options: TrackingOptions;

  constructor(options: TrackingOptions) {
    this.options = options;
  }

  /**
   * Handles clipboard events (copy, paste, cut)
   */
  handleClipboardEvent(event: ClipboardEvent, onEventCreated: (event: BehaviorEvent) => void): void {
    if (!this.options.trackCopyPaste) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if the element is a form element or has a form-related role
    const isFormElement = TrackingUtils.isFormElement(target);
    if (!isFormElement) return;

    // Get clipboard data if available
    let clipboardData: { types: string[]; data: string } | undefined;
    if (event.clipboardData) {
      const types = Array.from(event.clipboardData.types);
      const data = event.clipboardData.getData('text/plain');
      clipboardData = { types, data };
    }

    const behaviorEvent = TrackingUtils.createBehaviorEvent(
      event.type as 'copy' | 'paste' | 'cut',
      target,
      TrackingUtils.getElementValue(target),
      { clipboardData }
    );

    onEventCreated(behaviorEvent);
  }

  /**
   * Handles copy events specifically
   */
  handleCopyEvent(event: ClipboardEvent, onEventCreated: (event: BehaviorEvent) => void): void {
    this.handleClipboardEvent(event, onEventCreated);
  }

  /**
   * Handles paste events specifically
   */
  handlePasteEvent(event: ClipboardEvent, onEventCreated: (event: BehaviorEvent) => void): void {
    this.handleClipboardEvent(event, onEventCreated);
  }

  /**
   * Handles cut events specifically
   */
  handleCutEvent(event: ClipboardEvent, onEventCreated: (event: BehaviorEvent) => void): void {
    this.handleClipboardEvent(event, onEventCreated);
  }
}
