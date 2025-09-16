# Browser Metadata Collection Example

## Basic Usage

```javascript
import { BehaviorTracker } from './src/BehaviorTracker.js';
import { BrowserMetadataCollector } from './src/BrowserMetadataCollector.js';

// Initialize the tracker
const tracker = new BehaviorTracker({
  trackInputChanges: true,
  trackFocusBlur: true,
  trackClicks: true
});

// Start tracking
tracker.startTracking();

// Get insights with browser metadata
const insights = tracker.getInsights();
console.log('Browser Metadata:', insights.browserMetadata);

// Get additional metadata (via BehaviorTracker)
const additionalMetadata = tracker.getAdditionalMetadata();
console.log('Additional Metadata:', additionalMetadata);

// Get high-entropy metadata (requires user permission)
const highEntropyMetadata = await tracker.getHighEntropyMetadata();
console.log('High-Entropy Metadata:', highEntropyMetadata);

// Or use BrowserMetadataCollector directly
const browserMetadata = BrowserMetadataCollector.getBrowserMetadata();
const browserFingerprint = BrowserMetadataCollector.getBrowserFingerprint();
const browserCapabilities = BrowserMetadataCollector.getBrowserCapabilities();

// Track custom events
tracker.trackCustomEvent('user_action', { action: 'button_clicked', buttonId: 'submit' });
tracker.trackCustomEvent('conversion', { type: 'purchase', value: 150.00 });

// Get custom event data
const customEvents = tracker.getCustomEvents();
const conversionEvents = tracker.getCustomEventsByName('conversion');
const customStats = tracker.getCustomEventStats();
```

## Available Browser Metadata

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

### Page Information
- `pageTitle`: Current page title
- `pageUrl`: Current page URL
- `referrer`: Referring page URL
- `domain`: Current domain
- `characterSet`: Document character encoding
- `readyState`: Document loading state

### Time & Location
- `timezone`: User's timezone
- `timezoneOffset`: Timezone offset in minutes
- `timestamp`: Current timestamp

## Additional Metadata (Advanced)

The `getAdditionalMetadata()` method provides:

### Performance Data
- Navigation timing information
- Memory usage (Chrome only)
- Page load metrics

### Network Information
- Connection type (4g, 3g, etc.)
- Download speed estimate
- Round-trip time

### Device Information
- Battery status (with permission)
- Media devices (cameras, microphones)
- WebGL renderer information
- Canvas fingerprinting data

### System Information
- Screen orientation
- Page visibility state
- Locale information

## High-Entropy Metadata (Modern APIs)

The `getHighEntropyMetadata()` method provides detailed information using the User-Agent Client Hints API:

### Platform Details
- `platform`: Detailed platform information
- `platformVersion`: Specific platform version
- `architecture`: CPU architecture (x86, arm64, etc.)
- `model`: Device model information

### Browser Details
- `uaFullVersion`: Complete browser version
- `fullVersionList`: Array of all browser components and versions

**Note**: This method is async and requires user permission in some browsers.

## Custom Events

The BehaviorTracker supports tracking custom events with rich data:

### Basic Custom Event Tracking

```javascript
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

### Custom Event Methods

- **`trackCustomEvent(eventName, customData, target?)`**: Creates and logs a custom event
- **`getCustomEvents()`**: Gets all custom events
- **`getCustomEventsByName(eventName)`**: Gets custom events by name
- **`getCustomEventsCount()`**: Gets total custom event count
- **`getCustomEventsCountByName(eventName)`**: Gets count for specific event name
- **`getCustomEventStats()`**: Gets detailed custom event statistics
- **`hasCustomEvent(eventName)`**: Checks if event has been triggered
- **`getLastCustomEvent(eventName?)`**: Gets last occurrence of event
- **`clearCustomEvents()`**: Clears all custom events

### Custom Event Statistics

```javascript
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

### Custom Events in Insights

Custom events are automatically included in behavior insights:

```javascript
const insights = tracker.getInsights();
console.log('Custom event stats:', insights.customEventStats);
console.log('Custom event count in metrics:', insights.browserMetadata);
```

## BrowserMetadataCollector

The `BrowserMetadataCollector` is a standalone utility class that can be used independently of the BehaviorTracker:

### Static Methods

- **`getBrowserMetadata()`**: Returns comprehensive browser metadata
- **`getAdditionalMetadata()`**: Returns advanced system information
- **`getHighEntropyMetadata()`**: Returns detailed browser info (async)
- **`getBrowserFingerprint()`**: Returns a simple browser fingerprint
- **`getBrowserCapabilities()`**: Returns supported browser features

### Example Usage

```javascript
import { BrowserMetadataCollector } from './src/BrowserMetadataCollector.js';

// Get basic metadata
const metadata = BrowserMetadataCollector.getBrowserMetadata();
console.log('Platform:', metadata.platform);
console.log('Browser:', metadata.browserName);
console.log('Is Mobile:', metadata.isMobile);

// Get browser fingerprint
const fingerprint = BrowserMetadataCollector.getBrowserFingerprint();
console.log('Fingerprint:', fingerprint);

// Check browser capabilities
const capabilities = BrowserMetadataCollector.getBrowserCapabilities();
console.log('WebGL Support:', capabilities.webGL);
console.log('Touch Events:', capabilities.touchEvents);
```

## Use Cases

### Fraud Detection
- Detect unusual browser configurations
- Identify automated browsers
- Track device fingerprinting

### User Experience
- Optimize for different screen sizes
- Adapt to user's language preferences
- Monitor performance metrics

### Analytics
- Understand user demographics
- Track device capabilities
- Monitor browser usage patterns

## Privacy Considerations

- Some metadata requires user permission (geolocation, battery, media devices)
- Be mindful of privacy regulations (GDPR, CCPA)
- Consider anonymizing sensitive data
- Only collect necessary information
