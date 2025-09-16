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
