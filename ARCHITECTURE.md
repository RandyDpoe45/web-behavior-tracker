# Architecture Overview

This project is now organized into separate, focused modules for better maintainability and reusability.

## File Structure

```
src/
├── BehaviorTracker.ts          # Core behavior tracking functionality
├── BrowserMetadataCollector.ts # Browser metadata collection utilities
├── types.ts                   # TypeScript type definitions
└── index.ts                   # Main exports
```

## Module Responsibilities

### BehaviorTracker.ts
- **Purpose**: Core behavior tracking and analysis
- **Responsibilities**:
  - Event tracking (clicks, inputs, focus, blur, etc.)
  - Metrics calculation
  - Risk score analysis
  - Suspicious pattern detection
  - Session management
- **Dependencies**: Uses `BrowserMetadataCollector` for metadata

### BrowserMetadataCollector.ts
- **Purpose**: Browser and system metadata collection
- **Responsibilities**:
  - Platform detection (modern APIs with fallbacks)
  - Browser identification
  - Mobile device detection
  - Performance metrics
  - Device capabilities
  - Browser fingerprinting
- **Dependencies**: None (standalone utility)

### types.ts
- **Purpose**: TypeScript type definitions
- **Responsibilities**:
  - Interface definitions
  - Type unions
  - Shared type exports

### index.ts
- **Purpose**: Main module exports
- **Responsibilities**:
  - Export public classes and types
  - Provide clean API surface

## Usage Patterns

### 1. Behavior Tracking Only
```javascript
import { BehaviorTracker } from './src/BehaviorTracker.js';

const tracker = new BehaviorTracker();
tracker.startTracking();
// ... tracking behavior
const insights = tracker.getInsights();
```

### 2. Browser Metadata Only
```javascript
import { BrowserMetadataCollector } from './src/BrowserMetadataCollector.js';

const metadata = BrowserMetadataCollector.getBrowserMetadata();
const fingerprint = BrowserMetadataCollector.getBrowserFingerprint();
```

### 3. Combined Usage
```javascript
import { BehaviorTracker, BrowserMetadataCollector } from './src/index.js';

const tracker = new BehaviorTracker();
// Both behavior tracking and metadata collection
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Behavior tracking logic is isolated
- Metadata collection is reusable
- Each module has a single responsibility

### 2. **Reusability**
- `BrowserMetadataCollector` can be used independently
- No coupling between modules
- Easy to test individual components

### 3. **Maintainability**
- Changes to metadata collection don't affect behavior tracking
- Clear boundaries between functionality
- Easier to debug and extend

### 4. **Performance**
- Only load what you need
- Lazy loading of metadata when required
- Smaller bundle sizes for specific use cases

### 5. **Future-Proof**
- Easy to add new metadata collectors
- Behavior tracking can be extended independently
- Modular updates and improvements

## Migration Guide

If you were using the previous version:

### Before (Old)
```javascript
const tracker = new BehaviorTracker();
const metadata = tracker.getBrowserMetadata();
```

### After (New)
```javascript
// Option 1: Via BehaviorTracker (backward compatible)
const tracker = new BehaviorTracker();
const metadata = tracker.getBrowserMetadata();

// Option 2: Direct usage (recommended for metadata-only needs)
import { BrowserMetadataCollector } from './src/BrowserMetadataCollector.js';
const metadata = BrowserMetadataCollector.getBrowserMetadata();
```

The API remains backward compatible, but you now have the option to use `BrowserMetadataCollector` directly for better performance and cleaner code when you only need metadata.
