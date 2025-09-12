# Web Behavior Tracker

A framework-agnostic npm package for tracking user behavior on web forms. This package helps you gather insights about how users interact with your forms, detect suspicious patterns, and calculate risk scores.

## Features

- Track user interactions with form fields (focus, blur, input, change)
- **Track copy-paste operations** (copy, paste, cut events with clipboard data)
- Monitor mouse movements and clicks
- Calculate risk scores based on user behavior
- Detect suspicious patterns (rapid form filling, copy-paste behavior, etc.)
- Generate detailed metrics and insights
- Framework-agnostic implementation
- TypeScript support
- Cross-page session tracking
- Automatic session persistence
- Configurable time-based risk thresholds

## Installation

```bash
npm install web-behavior-tracker
```

## Usage

```typescript
import { BehaviorTracker } from 'web-behavior-tracker';

// Create a new tracker instance with optional configuration
const tracker = new BehaviorTracker({
  trackMouseMovements: true,
  trackFocusBlur: true,
  trackInputChanges: true,
  trackClicks: true,
  trackCopyPaste: true,   // Track copy-paste operations (default: true)
  riskThreshold: 0.7,
  minTimeSpent: 10000,    // 10 seconds - minimum time before considering it suspicious
  maxTimeSpent: 600000,   // 10 minutes - maximum time before considering it suspicious
  throttleDelay: 150      // 150ms throttle delay to prevent excessive event tracking
});

// Start tracking user behavior
tracker.startTracking();

// Start tracking with session reset (clears previous session data)
tracker.startTracking(true);

// Later, when you want to stop tracking
tracker.stopTracking();

// Get metrics about user behavior
const metrics = tracker.getMetrics();
console.log('Time spent:', metrics.timeSpent);
console.log('Field interactions:', metrics.fieldInteractions);
console.log('Field changes:', metrics.fieldChanges);
console.log('Copy operations:', metrics.copyCount);
console.log('Paste operations:', metrics.pasteCount);
console.log('Cut operations:', metrics.cutCount);

// Get insights and risk assessment
const insights = tracker.getInsights();
console.log('Risk score:', insights.riskScore);
console.log('Suspicious patterns:', insights.suspiciousPatterns);
console.log('Completion rate:', insights.completionRate);

// Get all tracked events
const events = tracker.getEvents();

// Get the current session ID
const sessionId = tracker.getSessionId();

// Clear the current session data
tracker.clearSession();
```

## Copy-Paste Tracking

The library now includes comprehensive copy-paste tracking capabilities:

### Features

- **Explicit Event Tracking**: Captures `copy`, `paste`, and `cut` events on form elements
- **Clipboard Data**: Records clipboard content and data types when available
- **Element Context**: Tracks which form field the operation occurred on
- **Timestamps**: Records when each operation happened
- **Fallback Detection**: Uses rapid input events as indicators of copy-paste behavior

### Usage

```typescript
// Copy-paste tracking is enabled by default
const tracker = new BehaviorTracker({
  trackCopyPaste: true  // This is the default
});

// Get copy-paste metrics
const metrics = tracker.getMetrics();
console.log('Copy operations:', metrics.copyCount);
console.log('Paste operations:', metrics.pasteCount);
console.log('Cut operations:', metrics.cutCount);

// Get all events including copy-paste events
const events = tracker.getEvents();
const copyPasteEvents = events.filter(e => ['copy', 'paste', 'cut'].includes(e.type));

// Each copy-paste event includes:
copyPasteEvents.forEach(event => {
  console.log('Event type:', event.type);
  console.log('Element:', event.elementId);
  console.log('Clipboard data:', event.clipboardData);
  console.log('Timestamp:', new Date(event.timestamp));
});
```

### Event Data Structure

Copy-paste events include additional `clipboardData` information:

```typescript
interface ClipboardData {
  types: string[];  // Available clipboard data types (e.g., ['text/plain'])
  data: string;     // The actual clipboard content
}
```

### Disabling Copy-Paste Tracking

If you don't want to track copy-paste operations:

```typescript
const tracker = new BehaviorTracker({
  trackCopyPaste: false
});
```

## Cross-Page Tracking

The package automatically maintains a session across page navigations using the browser's sessionStorage. This means:

- User behavior is tracked across all pages in the same session
- Data persists even when the user navigates between pages
- Each session has a unique ID that can be used to correlate events
- Session data is automatically saved when the user leaves a page
- Session data is cleared when the browser tab is closed

To use cross-page tracking:

1. Initialize the tracker on your main page or app entry point
2. The tracker will automatically maintain the session across page navigations
3. Use `getSessionId()` to get the current session identifier
4. Use `clearSession()` to manually clear the session data

### Session Reset on Start

The `startTracking()` method now accepts an optional `reset` parameter:

```typescript
// Start tracking without clearing existing session data
tracker.startTracking();

// Start tracking and clear all previous session data
tracker.startTracking(true);
```

This is useful when you want to:
- Start fresh tracking for a new user session
- Clear accumulated data before starting a new form flow
- Reset tracking state programmatically without calling `clearSession()` separately

## Configuration Options

The `BehaviorTracker` constructor accepts the following options:

```typescript
interface TrackingOptions {
  trackMouseMovements?: boolean;  // Track mouse movements (default: false)
  trackFocusBlur?: boolean;       // Track focus and blur events (default: true)
  trackInputChanges?: boolean;    // Track input and change events (default: true)
  trackClicks?: boolean;          // Track click events (default: true)
  trackCopyPaste?: boolean;       // Track copy-paste operations (default: true)
  customEvents?: string[];        // Additional events to track
  riskThreshold?: number;         // Threshold for risk score (default: 0.7)
  minTimeSpent?: number;          // Minimum time in milliseconds before considering it suspicious (default: 5000ms)
  maxTimeSpent?: number;          // Maximum time in milliseconds before considering it suspicious (default: 300000ms)
  throttleDelay?: number;         // Throttle delay in milliseconds to prevent excessive event tracking (default: 100ms)
}
```

### Time-Based Risk Assessment

The package uses time-based thresholds to assess risk:

- If a user spends less than `minTimeSpent` (default: 5 seconds) on the form, it increases the risk score by 0.3
- If a user spends more than `maxTimeSpent` (default: 5 minutes) on the form, it increases the risk score by 0.2

You can customize these thresholds based on your form's complexity and expected completion time:

```typescript
// Example: Custom time thresholds for a complex form
const tracker = new BehaviorTracker({
  minTimeSpent: 30000,    // 30 seconds minimum
  maxTimeSpent: 900000    // 15 minutes maximum
});

// Example: Stricter thresholds for a simple form
const tracker = new BehaviorTracker({
  minTimeSpent: 2000,     // 2 seconds minimum
  maxTimeSpent: 120000    // 2 minutes maximum
});
```

### Event Throttling

The package includes built-in event throttling to prevent excessive event tracking and improve performance:

- Events are throttled based on the `throttleDelay` parameter (default: 100ms)
- This prevents rapid-fire events from overwhelming the tracking system
- You can adjust the throttle delay based on your needs:

```typescript
// Example: More aggressive throttling for high-frequency events
const tracker = new BehaviorTracker({
  throttleDelay: 200      // 200ms throttle delay
});

// Example: Less throttling for more detailed tracking
const tracker = new BehaviorTracker({
  throttleDelay: 50       // 50ms throttle delay
});
```

## Metrics

The package provides the following metrics:

- Time spent on the form
- Number of field interactions
- Number of field changes
- Focus and blur counts
- Mouse interaction counts
- **Copy, paste, and cut operation counts**
- Cross-page navigation patterns
- Page-specific interaction data

## Insights

The insights include:

- Risk score (0-1)
- Suspicious patterns detected
- Form completion rate
- Average time per field
- Field interaction order
- Cross-page behavior patterns
- Session-level risk assessment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 