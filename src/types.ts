export interface ElementState {
  checked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  valid?: boolean;
  validationMessage?: string;
  selectedIndex?: number;
  selectedOptions?: Array<{
    value: string;
    text: string;
    index: number;
  }>;
}

export interface BehaviorEvent {
  type: 'focus' | 'blur' | 'change' | 'input' | 'delete' | 'click' | 'invalid' | 'reset' | 'submit' | 
        'mouseover' | 'mouseout' | 'select-change' | 'checkbox-radio-change' | 'form-submit' |
        'copy' | 'paste' | 'cut' | 'custom' | string; // Allow custom event names
  elementId: string;
  elementType: string;
  timestamp: number;
  value: string | boolean | string[] | null;
  pageUrl: string;
  elementAttributes: Record<string, string>;
  elementState?: ElementState;
  selectedOptions?: Array<{
    value: string;
    text: string;
    selected: boolean;
  }>;
  clipboardData?: {
    types: string[];
    data: string;
  };
  customEventName?: string;
  customData?: Record<string, any>;
}

export interface FormField {
  id: string;
  type: string;
  name: string;
  value: string;
  isRequired: boolean;
}

export interface BehaviorMetrics {
  timeSpent: number;
  fieldInteractions: number;
  fieldChanges: number;
  focusCount: number;
  blurCount: number;
  mouseInteractions: number;
  copyCount: number;
  pasteCount: number;
  cutCount: number;
  deleteCount: number;
  customEventCount: number;
}

export interface BrowserMetadata {
  userAgent: string;
  platform: string;
  platformVersion?: string;
  browserName?: string;
  browserVersion?: string;
  isMobile?: boolean;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  screenColorDepth: number;
  screenPixelDepth: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  pageTitle: string;
  pageUrl: string;
  referrer: string;
  domain: string;
  characterSet: string;
  readyState: string;
  timezone: string;
  timezoneOffset: number;
  timestamp: number;
}

export interface CustomEventStats {
  totalCustomEvents: number;
  eventsByName: Record<string, number>;
  recentEvents: BehaviorEvent[];
  lastEvent?: BehaviorEvent;
}

export interface BehaviorInsights {
  riskScore: number;
  suspiciousPatterns: string[];
  completionRate: number;
  averageTimePerField: number;
  fieldInteractionOrder: string[];
  browserMetadata: BrowserMetadata;
  customEventStats: CustomEventStats;
}

export interface TrackingOptions {
  trackMouseMovements?: boolean;
  trackFocusBlur?: boolean;
  trackInputChanges?: boolean;
  trackClicks?: boolean;
  trackCopyPaste?: boolean;
  riskThreshold?: number;
  minTimeSpent?: number;  // Minimum time in milliseconds before considering it suspicious
  maxTimeSpent?: number;  // Maximum time in milliseconds before considering it suspicious
  throttleDelay?: number; // Throttle delay in milliseconds to prevent excessive event tracking
} 