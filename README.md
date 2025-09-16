# Web Behavior Tracker

A framework-agnostic npm package for tracking user behavior on web forms. This package helps you gather insights about how users interact with your forms, detect suspicious patterns, and calculate risk scores.

## Features

- Track user interactions with form fields (focus, blur, input, change)
- **Track copy-paste operations** (copy, paste, cut events with clipboard data)
- **Track custom events** with rich data for business intelligence
- Monitor mouse movements and clicks
- Calculate risk scores based on user behavior
- Detect suspicious patterns (rapid form filling, copy-paste behavior, etc.)
- Generate detailed metrics and insights
- Framework-agnostic implementation
- TypeScript support
- Cross-page session tracking
- Automatic session persistence
- Configurable time-based risk thresholds
- **Modular architecture** with separate event handlers
- **Browser metadata collection** for device fingerprinting

## Installation

```bash
npm install web-behavior-tracker
```

## Quick Start

```typescript
import { BehaviorTracker } from 'web-behavior-tracker';

// Create a new tracker instance
const tracker = new BehaviorTracker({
  trackMouseMovements: true,
  trackFocusBlur: true,
  trackInputChanges: true,
  trackClicks: true,
  trackCopyPaste: true,
  riskThreshold: 0.7,
  minTimeSpent: 10000,    // 10 seconds minimum
  maxTimeSpent: 600000,   // 10 minutes maximum
  throttleDelay: 150      // 150ms throttle delay
});

// Start tracking
tracker.startTracking();

// Get insights
const insights = tracker.getInsights();
console.log('Risk score:', insights.riskScore);
console.log('Suspicious patterns:', insights.suspiciousPatterns);
```

## Architecture

The package uses a modular architecture with separate event handlers for better maintainability:

```
src/
├── BehaviorTracker.ts          # Main behavior tracking class
├── BrowserMetadataCollector.ts # Browser metadata collection
├── InputEventHandler.ts        # Input, delete, and autocomplete events
├── FormEventHandler.ts         # Form-specific events (select, submit, etc.)
├── MouseEventHandler.ts        # Mouse events (click, focus, blur, etc.)
├── ClipboardEventHandler.ts    # Clipboard events (copy, paste, cut)
├── CustomEventHandler.ts       # Custom events (user-defined events)
├── utils.ts                    # Shared utility functions
├── types.ts                    # TypeScript type definitions
└── index.ts                    # Main exports
```

### Usage Patterns

#### 1. Behavior Tracking Only
```javascript
import { BehaviorTracker } from './src/BehaviorTracker.js';

const tracker = new BehaviorTracker();
tracker.startTracking();
const insights = tracker.getInsights();
```

#### 2. Browser Metadata Only
```javascript
import { BrowserMetadataCollector } from './src/BrowserMetadataCollector.js';

const metadata = BrowserMetadataCollector.getBrowserMetadata();
const fingerprint = BrowserMetadataCollector.getBrowserFingerprint();
```

#### 3. Individual Event Handlers
```javascript
import { InputEventHandler, FormEventHandler } from './src/index.js';

const inputHandler = new InputEventHandler({ trackInputChanges: true });
const formHandler = new FormEventHandler({ trackInputChanges: true });
```

## Copy-Paste Tracking

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
```

### Event Data Structure
```typescript
interface ClipboardData {
  types: string[];  // Available clipboard data types (e.g., ['text/plain'])
  data: string;     // The actual clipboard content
}
```

## Custom Events

Track custom user actions and business events with rich data:

### Basic Usage
```typescript
// Track a simple custom event
tracker.trackCustomEvent('user_action', { action: 'button_clicked' });

// Track with target element
tracker.trackCustomEvent('form_error', { field: 'email' }, document.getElementById('email'));

// Track complex business events
tracker.trackCustomEvent('conversion', {
  type: 'purchase',
  value: 150.00,
  productIds: ['123', '456'],
  customerId: 'user_789'
});
```

### Advanced Custom Event Examples
```typescript
// Track user journey events
tracker.trackCustomEvent('page_navigation', {
  from: '/home',
  to: '/products',
  method: 'click',
  element: 'navigation-link'
});

// Track business metrics
tracker.trackCustomEvent('conversion', {
  type: 'purchase',
  value: 150.00,
  currency: 'USD',
  productIds: ['123', '456'],
  customerId: 'user_789'
});

// Track user behavior patterns
tracker.trackCustomEvent('scroll_behavior', {
  scrollDepth: 0.75,
  scrollDirection: 'down',
  timeOnPage: 45000,
  elementInView: 'product-gallery'
});
```

### Custom Event Methods
- `trackCustomEvent(eventName, customData, target?)` - Creates and logs a custom event
- `getCustomEvents()` - Gets all custom events
- `getCustomEventsByName(eventName)` - Gets custom events by name
- `getCustomEventsCount()` - Gets total custom event count
- `getCustomEventStats()` - Gets detailed custom event statistics
- `hasCustomEvent(eventName)` - Checks if event has been triggered
- `getLastCustomEvent(eventName?)` - Gets last occurrence of event
- `clearCustomEvents()` - Clears all custom events

### Custom Event Statistics
```typescript
const stats = tracker.getCustomEventStats();
console.log(stats);
// Output:
// {
//   totalCustomEvents: 15,
//   eventsByName: {
//     'user_action': 5,
//     'conversion': 2,
//     'error': 3,
//     'engagement': 5
//   },
//   recentEvents: [...], // Last 10 events
//   lastEvent: {...} // Most recent event
// }
```

## Browser Metadata Collection

The `BrowserMetadataCollector` provides comprehensive browser and device information:

### Basic Browser Information
- `userAgent`: Full user agent string
- `platform`: Operating system platform (using modern User-Agent Client Hints API)
- `platformVersion`: Platform version (when available)
- `browserName`: Browser name (Chrome, Firefox, Safari, Edge)
- `browserVersion`: Browser version (when available)
- `isMobile`: Whether the device is mobile
- `language`: User's preferred language
- `languages`: Array of preferred languages
- `cookieEnabled`: Whether cookies are enabled
- `onLine`: Whether browser is online
- `hardwareConcurrency`: Number of CPU cores
- `maxTouchPoints`: Maximum touch points supported

### Screen & Display Information
- `screenWidth/Height`: Screen dimensions
- `screenAvailWidth/Height`: Available screen dimensions
- `screenColorDepth`: Color depth
- `screenPixelDepth`: Pixel depth
- `viewportWidth/Height`: Browser viewport dimensions
- `devicePixelRatio`: Device pixel ratio

### Usage
```typescript
import { BrowserMetadataCollector } from 'web-behavior-tracker';

// Get basic metadata
const metadata = BrowserMetadataCollector.getBrowserMetadata();
console.log('Platform:', metadata.platform);
console.log('Browser:', metadata.browserName);
console.log('Is Mobile:', metadata.isMobile);

// Get browser fingerprint
const fingerprint = BrowserMetadataCollector.getBrowserFingerprint();
console.log('Fingerprint:', fingerprint);

// Get additional metadata (advanced system information)
const additionalMetadata = BrowserMetadataCollector.getAdditionalMetadata();

// Get high-entropy metadata (requires user permission)
const highEntropyMetadata = await BrowserMetadataCollector.getHighEntropyMetadata();
```

## Cross-Page Tracking

The package automatically maintains a session across page navigations using the browser's sessionStorage:

- User behavior is tracked across all pages in the same session
- Data persists even when the user navigates between pages
- Each session has a unique ID that can be used to correlate events
- Session data is automatically saved when the user leaves a page
- Session data is cleared when the browser tab is closed

### Session Management
```typescript
// Start tracking without clearing existing session data
tracker.startTracking();

// Start tracking and clear all previous session data
tracker.startTracking(true);

// Get the current session ID
const sessionId = tracker.getSessionId();

// Clear the current session data
tracker.clearSession();
```

## Configuration Options

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

Events are throttled based on the `throttleDelay` parameter (default: 100ms) to prevent excessive event tracking:

```typescript
// More aggressive throttling for high-frequency events
const tracker = new BehaviorTracker({
  throttleDelay: 200      // 200ms throttle delay
});

// Less throttling for more detailed tracking
const tracker = new BehaviorTracker({
  throttleDelay: 50       // 50ms throttle delay
});
```

## Metrics

The package provides comprehensive metrics:

- Time spent on the form
- Number of field interactions
- Number of field changes
- Focus and blur counts
- Mouse interaction counts
- Copy, paste, and cut operation counts
- Cross-page navigation patterns
- Page-specific interaction data
- Custom event counts and statistics

## Insights

The insights include:

- Risk score (0-1)
- Suspicious patterns detected
- Form completion rate
- Average time per field
- Field interaction order
- Cross-page behavior patterns
- Session-level risk assessment
- Custom event statistics
- Browser metadata and capabilities

## Use Cases

### Fraud Detection
- Detect unusual browser configurations
- Identify automated browsers
- Track device fingerprinting
- Monitor suspicious behavior patterns

### User Experience
- Optimize for different screen sizes
- Adapt to user's language preferences
- Monitor performance metrics
- Track user journey and engagement

### Analytics
- Understand user demographics
- Track device capabilities
- Monitor browser usage patterns
- Business intelligence and conversion tracking

### A/B Testing
- Variant selection tracking
- Test completion rates
- User behavior differences
- Conversion impact analysis

## Privacy Considerations

- Some metadata requires user permission (geolocation, battery, media devices)
- Be mindful of privacy regulations (GDPR, CCPA)
- Consider anonymizing sensitive data
- Only collect necessary information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT