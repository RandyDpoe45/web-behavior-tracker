# Modular Architecture Documentation

This project has been refactored into a modular architecture with separate event handlers and utility functions for better maintainability and reusability.

## File Structure

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

## Event Handler Classes

### 1. InputEventHandler
**Purpose**: Handles input events including typing, deleting, and autocomplete detection

**Key Methods**:
- `handleInputEvent(event, onEventCreated)` - Main input event handler
- `clear()` - Clears stored input values and times
- `getLastValue(elementId)` - Gets last known value for an element
- `getLastInputTime(elementId)` - Gets last input time for an element

**Features**:
- Detects input vs delete vs autocomplete events
- Tracks input timing for autocomplete detection
- Maintains element value history

### 2. FormEventHandler
**Purpose**: Handles form-specific events like select changes, checkbox/radio changes, and form submissions

**Key Methods**:
- `handleSelectChange(event, onEventCreated)` - Select element changes
- `handleCheckboxRadioChange(event, onEventCreated)` - Checkbox/radio changes
- `handleFormSubmit(event, onEventCreated)` - Form submission
- `handleFormValidation(event, onEventCreated)` - Form validation events
- `handleFormReset(event, onEventCreated)` - Form reset events

**Features**:
- Tracks form submission data
- Handles select option changes
- Monitors form validation states

### 3. MouseEventHandler
**Purpose**: Handles mouse events like clicks, focus, blur, and mouse movements

**Key Methods**:
- `handleMouseEvent(event, onEventCreated)` - General mouse events
- `handleClickEvent(event, onEventCreated)` - Click events specifically
- `handleMouseMovementEvent(event, onEventCreated)` - Mouse movement events
- `handleFocusBlurEvent(event, onEventCreated)` - Focus and blur events

**Features**:
- Throttling for performance
- Form element filtering
- Event type validation

### 4. ClipboardEventHandler
**Purpose**: Handles clipboard events like copy, paste, and cut

**Key Methods**:
- `handleClipboardEvent(event, onEventCreated)` - General clipboard events
- `handleCopyEvent(event, onEventCreated)` - Copy events
- `handlePasteEvent(event, onEventCreated)` - Paste events
- `handleCutEvent(event, onEventCreated)` - Cut events

**Features**:
- Clipboard data extraction
- Form element filtering
- Event type detection

### 5. CustomEventHandler
**Purpose**: Handles custom events that can be manually triggered by the application

**Key Methods**:
- `createCustomEvent(eventName, customData, target, onEventCreated)` - Creates custom events
- `getCustomEvents()` - Gets all custom events
- `getCustomEventsByName(eventName)` - Gets events by name
- `getCustomEventsStats()` - Gets event statistics
- `hasCustomEvent(eventName)` - Checks if event exists
- `getLastCustomEvent(eventName?)` - Gets last occurrence
- `clearCustomEvents()` - Clears all custom events

**Features**:
- Flexible event creation with custom data
- Separate custom event storage
- Rich querying and statistics
- Business intelligence tracking

## Utility Functions (TrackingUtils)

### Core Utilities
- `isFormElement(element)` - Checks if element is a form element
- `getElementValue(element)` - Gets current value of an element
- `getElementAttributes(element)` - Gets relevant element attributes
- `getElementState(element)` - Gets current state of an element
- `getElementPath(element)` - Gets DOM path for element identification

### Event Creation
- `createBehaviorEvent(type, target, value, additionalData)` - Creates behavior events
- `shouldTrackEvent(eventType, options)` - Checks if event should be tracked

### Performance Utilities
- `throttle(func, delay)` - Throttles function calls
- `debounce(func, delay)` - Debounces function calls

### Autocomplete Detection
- `isAutocompleteEvent(currentValue, previousValue, currentTime, lastInputTime, target)` - Detects autocomplete
- `isCompleteWordInput(currentValue, previousValue)` - Checks for complete word input
- `isAutocompleteField(target)` - Checks if field is commonly used for autocomplete
- `hasAutocompletePatterns(currentValue, previousValue)` - Checks for autocomplete patterns

## BehaviorTracker Integration

The main `BehaviorTracker` class now uses these event handlers:

```typescript
export class BehaviorTracker {
  // Event handlers
  private inputHandler: InputEventHandler;
  private formHandler: FormEventHandler;
  private mouseHandler: MouseEventHandler;
  private clipboardHandler: ClipboardEventHandler;

  constructor(options: TrackingOptions = {}) {
    // Initialize event handlers
    this.inputHandler = new InputEventHandler(this.options);
    this.formHandler = new FormEventHandler(this.options);
    this.mouseHandler = new MouseEventHandler(this.options, this.THROTTLE_DELAY);
    this.clipboardHandler = new ClipboardEventHandler(this.options);
  }
}
```

## Usage Examples

### 1. Using Individual Event Handlers

```javascript
import { InputEventHandler, FormEventHandler } from './src/index.js';

// Create individual handlers
const inputHandler = new InputEventHandler({ trackInputChanges: true });
const formHandler = new FormEventHandler({ trackInputChanges: true });

// Handle events
inputHandler.handleInputEvent(event, (behaviorEvent) => {
  console.log('Input event:', behaviorEvent);
});

formHandler.handleFormSubmit(event, (behaviorEvent) => {
  console.log('Form submit:', behaviorEvent);
});
```

### 2. Using BehaviorTracker (Integrated)

```javascript
import { BehaviorTracker } from './src/index.js';

const tracker = new BehaviorTracker({
  trackInputChanges: true,
  trackFocusBlur: true,
  trackClicks: true
});

tracker.startTracking();
// All event handlers are automatically set up
```

### 3. Using Utility Functions

```javascript
import { TrackingUtils } from './src/index.js';

// Check if element is a form element
const isForm = TrackingUtils.isFormElement(element);

// Get element value
const value = TrackingUtils.getElementValue(element);

// Create a behavior event
const event = TrackingUtils.createBehaviorEvent('click', element, 'button clicked');
```

## Benefits of Modular Architecture

### 1. **Separation of Concerns**
- Each event handler has a single responsibility
- Utility functions are reusable across handlers
- Clear boundaries between different event types

### 2. **Reusability**
- Event handlers can be used independently
- Utility functions can be used in other projects
- Easy to test individual components

### 3. **Maintainability**
- Changes to one event type don't affect others
- Easy to add new event handlers
- Clear code organization

### 4. **Performance**
- Only load what you need
- Optimized event handling per type
- Better memory management

### 5. **Extensibility**
- Easy to add new event types
- Simple to create custom event handlers
- Modular updates and improvements

## Custom Events Usage

### 1. **Basic Custom Event Tracking**
```javascript
import { BehaviorTracker } from './src/index.js';

const tracker = new BehaviorTracker();

// Track simple custom events
tracker.trackCustomEvent('user_action', { action: 'button_clicked' });

// Track with target element
tracker.trackCustomEvent('form_error', { field: 'email' }, document.getElementById('email'));

// Track complex business events
tracker.trackCustomEvent('conversion', {
  type: 'purchase',
  value: 150.00,
  productIds: ['123', '456']
});
```

### 2. **Custom Event Querying**
```javascript
// Get all custom events
const allCustomEvents = tracker.getCustomEvents();

// Get events by name
const conversionEvents = tracker.getCustomEventsByName('conversion');

// Get statistics
const stats = tracker.getCustomEventStats();
console.log('Total custom events:', stats.totalCustomEvents);
console.log('Events by name:', stats.eventsByName);

// Check if event exists
if (tracker.hasCustomEvent('conversion')) {
  console.log('User has converted!');
}
```

### 3. **Custom Events in Insights**
```javascript
const insights = tracker.getInsights();
console.log('Custom event stats:', insights.customEventStats);
console.log('Custom event count:', insights.browserMetadata);
```

### 4. **Using CustomEventHandler Directly**
```javascript
import { CustomEventHandler } from './src/index.js';

const customHandler = new CustomEventHandler({});
customHandler.createCustomEvent('test_event', { data: 'test' }, undefined, (event) => {
  console.log('Custom event created:', event);
});
```

## Migration Guide

### Before (Monolithic)
```javascript
const tracker = new BehaviorTracker();
// All event handling was internal
```

### After (Modular)
```javascript
// Option 1: Use integrated BehaviorTracker (backward compatible)
const tracker = new BehaviorTracker();

// Option 2: Use individual handlers
const inputHandler = new InputEventHandler(options);
const formHandler = new FormEventHandler(options);
```

The API remains backward compatible, but you now have the option to use individual event handlers for more granular control.

## Testing

Each event handler can be tested independently:

```javascript
// Test input handler
const inputHandler = new InputEventHandler({ trackInputChanges: true });
const mockEvent = new Event('input');
const mockTarget = document.createElement('input');
mockEvent.target = mockTarget;

inputHandler.handleInputEvent(mockEvent, (event) => {
  expect(event.type).toBe('input');
});
```

This modular architecture provides better code organization, improved maintainability, and enhanced reusability while maintaining full backward compatibility.
