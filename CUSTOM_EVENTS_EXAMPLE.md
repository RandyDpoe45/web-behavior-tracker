# Custom Events Example

This document shows how to use the custom event functionality in the BehaviorTracker.

## Basic Usage

```javascript
import { BehaviorTracker } from './src/index.js';

// Initialize the tracker
const tracker = new BehaviorTracker({
  trackInputChanges: true,
  trackFocusBlur: true,
  trackClicks: true
});

// Start tracking
tracker.startTracking();

// Track a custom event
tracker.trackCustomEvent('user_action', {
  action: 'button_clicked',
  buttonId: 'submit-btn',
  timestamp: Date.now(),
  additionalData: { page: 'checkout' }
});

// Track another custom event
tracker.trackCustomEvent('form_validation_error', {
  fieldName: 'email',
  errorMessage: 'Invalid email format',
  fieldValue: 'invalid-email'
}, document.getElementById('email-field'));
```

## Advanced Usage

### 1. Tracking User Journey Events

```javascript
// Track page navigation
tracker.trackCustomEvent('page_navigation', {
  from: '/home',
  to: '/products',
  method: 'click',
  element: 'navigation-link'
});

// Track product interaction
tracker.trackCustomEvent('product_interaction', {
  productId: '12345',
  action: 'view',
  category: 'electronics',
  price: 299.99
});

// Track checkout process
tracker.trackCustomEvent('checkout_step', {
  step: 'payment',
  stepNumber: 3,
  totalSteps: 4,
  paymentMethod: 'credit_card'
});
```

### 2. Tracking Business Metrics

```javascript
// Track conversion events
tracker.trackCustomEvent('conversion', {
  type: 'purchase',
  value: 150.00,
  currency: 'USD',
  productIds: ['123', '456'],
  customerId: 'user_789'
});

// Track engagement metrics
tracker.trackCustomEvent('engagement', {
  type: 'video_watch',
  videoId: 'intro_video',
  duration: 120, // seconds
  completionRate: 0.75
});

// Track error events
tracker.trackCustomEvent('error', {
  type: 'api_error',
  endpoint: '/api/checkout',
  statusCode: 500,
  errorMessage: 'Internal server error',
  userId: 'user_123'
});
```

### 3. Tracking User Behavior Patterns

```javascript
// Track scroll behavior
tracker.trackCustomEvent('scroll_behavior', {
  scrollDepth: 0.75,
  scrollDirection: 'down',
  timeOnPage: 45000, // milliseconds
  elementInView: 'product-gallery'
});

// Track search behavior
tracker.trackCustomEvent('search_behavior', {
  query: 'laptop',
  resultsCount: 25,
  filters: ['price:100-500', 'brand:apple'],
  timeToResults: 1200 // milliseconds
});

// Track form abandonment
tracker.trackCustomEvent('form_abandonment', {
  formId: 'contact-form',
  fieldsCompleted: 3,
  totalFields: 5,
  timeSpent: 120000, // milliseconds
  lastField: 'phone'
});
```

## Retrieving Custom Events

### 1. Get All Custom Events

```javascript
// Get all custom events
const allCustomEvents = tracker.getCustomEvents();
console.log('Total custom events:', allCustomEvents.length);

// Get custom events by name
const conversionEvents = tracker.getCustomEventsByName('conversion');
console.log('Conversion events:', conversionEvents);
```

### 2. Get Custom Event Statistics

```javascript
// Get custom event statistics
const stats = tracker.getCustomEventStats();
console.log('Custom event stats:', stats);

// Output example:
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

### 3. Check for Specific Events

```javascript
// Check if a specific event has been triggered
if (tracker.hasCustomEvent('conversion')) {
  console.log('User has converted!');
}

// Get the last occurrence of a specific event
const lastConversion = tracker.getLastCustomEvent('conversion');
if (lastConversion) {
  console.log('Last conversion:', lastConversion.customData);
}
```

## Integration with Insights

Custom events are automatically included in the behavior insights:

```javascript
const insights = tracker.getInsights();
console.log('Custom event stats:', insights.customEventStats);

// Custom events are also counted in metrics
const metrics = tracker.getMetrics();
console.log('Custom event count:', metrics.customEventCount);
```

## Using CustomEventHandler Directly

You can also use the CustomEventHandler independently:

```javascript
import { CustomEventHandler } from './src/index.js';

const customHandler = new CustomEventHandler({});

// Create custom events
customHandler.createCustomEvent('test_event', { data: 'test' }, undefined, (event) => {
  console.log('Custom event created:', event);
});

// Get statistics
const stats = customHandler.getCustomEventsStats();
console.log('Stats:', stats);
```

## Event Structure

Custom events have the following structure:

```typescript
interface BehaviorEvent {
  type: string; // The custom event name
  elementId: string;
  elementType: string;
  timestamp: number;
  value: string; // JSON stringified custom data
  pageUrl: string;
  elementAttributes: Record<string, string>;
  elementState?: ElementState;
  customEventName?: string; // The original event name
  customData?: Record<string, any>; // The custom data object
}
```

## Best Practices

### 1. Use Descriptive Event Names

```javascript
// Good
tracker.trackCustomEvent('product_added_to_cart', { productId: '123' });

// Avoid
tracker.trackCustomEvent('event1', { data: 'test' });
```

### 2. Include Relevant Context

```javascript
// Good - includes context
tracker.trackCustomEvent('button_click', {
  buttonId: 'checkout-btn',
  page: 'cart',
  userType: 'guest',
  cartValue: 150.00
});

// Avoid - too generic
tracker.trackCustomEvent('click', {});
```

### 3. Use Consistent Data Structure

```javascript
// Define a consistent structure for similar events
const trackUserAction = (action, context) => {
  tracker.trackCustomEvent('user_action', {
    action,
    timestamp: Date.now(),
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
    ...context
  });
};

// Use it consistently
trackUserAction('login', { method: 'email' });
trackUserAction('logout', { duration: 3600000 });
```

### 4. Clean Up Old Events

```javascript
// Clear custom events periodically to prevent memory issues
if (tracker.getCustomEventsCount() > 1000) {
  tracker.clearCustomEvents();
}
```

## Use Cases

### 1. E-commerce Tracking
- Product views, adds to cart, purchases
- Search behavior and filters
- Checkout process steps
- Payment method selection

### 2. User Experience Analytics
- Feature usage tracking
- Error monitoring
- Performance metrics
- User journey mapping

### 3. A/B Testing
- Variant selection tracking
- Test completion rates
- User behavior differences
- Conversion impact analysis

### 4. Business Intelligence
- Revenue tracking
- Customer segmentation
- Operational metrics
- KPI monitoring

This custom event system provides a flexible way to track any user behavior or business event that's important to your application!
