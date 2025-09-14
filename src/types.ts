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
  type: 'focus' | 'blur' | 'change' | 'input' | 'click' | 'invalid' | 'reset' | 'submit' | 
        'mouseover' | 'mouseout' | 'select-change' | 'checkbox-radio-change' | 'form-submit' |
        'copy' | 'paste' | 'cut';
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
}

export interface BehaviorInsights {
  riskScore: number;
  suspiciousPatterns: string[];
  completionRate: number;
  averageTimePerField: number;
  fieldInteractionOrder: string[];
}

export interface TrackingOptions {
  trackMouseMovements?: boolean;
  trackFocusBlur?: boolean;
  trackInputChanges?: boolean;
  trackClicks?: boolean;
  trackCopyPaste?: boolean;
  customEvents?: string[];
  riskThreshold?: number;
  minTimeSpent?: number;  // Minimum time in milliseconds before considering it suspicious
  maxTimeSpent?: number;  // Maximum time in milliseconds before considering it suspicious
  throttleDelay?: number; // Throttle delay in milliseconds to prevent excessive event tracking
} 