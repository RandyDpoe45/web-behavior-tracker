import { BrowserMetadata } from './types.js';

export class BrowserMetadataCollector {
  /**
   * Collects comprehensive browser metadata using modern APIs
   */
  public static getBrowserMetadata(): BrowserMetadata {
    const now = new Date();
    
    // Modern platform detection using User-Agent Client Hints API
    const platform = this.getPlatformInfo();
    const browserInfo = this.getBrowserInfo();
    const isMobile = this.detectMobile();
    
    return {
      userAgent: navigator.userAgent,
      platform: platform.name,
      platformVersion: platform.version,
      browserName: browserInfo.name,
      browserVersion: browserInfo.version,
      isMobile: isMobile,
      language: navigator.language,
      languages: [...(navigator.languages || [])],
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenAvailWidth: screen.availWidth,
      screenAvailHeight: screen.availHeight,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      pageTitle: document.title,
      pageUrl: window.location.href,
      referrer: document.referrer,
      domain: document.domain,
      characterSet: document.characterSet,
      readyState: document.readyState,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: now.getTimezoneOffset(),
      timestamp: now.getTime()
    };
  }

  /**
   * Gets platform information using modern APIs with fallbacks
   */
  private static getPlatformInfo(): { name: string; version?: string } {
    // Try modern User-Agent Client Hints API first
    if ('userAgentData' in navigator) {
      const uaData = (navigator as any).userAgentData;
      if (uaData && uaData.platform) {
        return {
          name: uaData.platform,
          version: uaData.platformVersion
        };
      }
    }
    
    // Fallback to deprecated navigator.platform (with privacy considerations)
    const platform = navigator.platform || 'unknown';
    
    // Parse platform from user agent as additional fallback
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('windows')) return { name: 'Windows' };
    if (userAgent.includes('mac')) return { name: 'macOS' };
    if (userAgent.includes('linux')) return { name: 'Linux' };
    if (userAgent.includes('android')) return { name: 'Android' };
    if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) return { name: 'iOS' };
    
    return { name: platform };
  }

  /**
   * Gets browser information using modern APIs with fallbacks
   */
  private static getBrowserInfo(): { name: string; version?: string } {
    // Try modern User-Agent Client Hints API first
    if ('userAgentData' in navigator) {
      const uaData = (navigator as any).userAgentData;
      if (uaData && uaData.brands) {
        const browser = uaData.brands.find((brand: any) => brand.brand && !brand.brand.includes('Not'));
        if (browser) {
          return {
            name: browser.brand,
            version: browser.version
          };
        }
      }
    }
    
    // Fallback to user agent parsing
    const userAgent = navigator.userAgent;
    
    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      return {
        name: 'Chrome',
        version: match ? match[1] : undefined
      };
    }
    
    // Firefox
    if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      return {
        name: 'Firefox',
        version: match ? match[1] : undefined
      };
    }
    
    // Safari
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      return {
        name: 'Safari',
        version: match ? match[1] : undefined
      };
    }
    
    // Edge
    if (userAgent.includes('Edg')) {
      const match = userAgent.match(/Edg\/(\d+\.\d+)/);
      return {
        name: 'Edge',
        version: match ? match[1] : undefined
      };
    }
    
    return { name: 'Unknown' };
  }

  /**
   * Detects if the device is mobile using multiple indicators
   */
  private static detectMobile(): boolean {
    // Check for touch capability and screen size
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
    
    // Check user agent for mobile indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileIndicators = [
      'mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'windows phone', 'opera mini', 'iemobile'
    ];
    const hasMobileUA = mobileIndicators.some(indicator => userAgent.includes(indicator));
    
    // Check for mobile-specific APIs
    const hasMobileAPIs = 'orientation' in screen || 'vibrate' in navigator;
    
    return hasMobileUA || (hasTouch && isSmallScreen) || hasMobileAPIs;
  }

  /**
   * Gets high-entropy metadata using User-Agent Client Hints API
   */
  public static async getHighEntropyMetadata(): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};
    
    try {
      // Try to get high-entropy values from User-Agent Client Hints API
      if ('userAgentData' in navigator && 'getHighEntropyValues' in (navigator as any).userAgentData) {
        const uaData = (navigator as any).userAgentData;
        const highEntropyValues = await uaData.getHighEntropyValues([
          'platform',
          'platformVersion',
          'architecture',
          'model',
          'uaFullVersion',
          'fullVersionList'
        ]);
        
        metadata.highEntropyUA = highEntropyValues;
      }
    } catch (error) {
      console.warn('High-entropy values not available:', error);
    }
    
    return metadata;
  }

  /**
   * Gets additional metadata including performance, network, and device information
   */
  public static getAdditionalMetadata(): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    try {
      // Performance timing
      if (performance.timing) {
        metadata.navigationTiming = {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd,
          domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        };
      }

      // Memory usage (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metadata.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }

      // Connection information (if available)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        metadata.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }

      // Battery information (if available and permission granted)
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          metadata.battery = {
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: battery.level
          };
        }).catch(() => {
          // Battery API not available or permission denied
        });
      }

      // Media devices (if available)
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          metadata.mediaDevices = devices.map(device => ({
            kind: device.kind,
            label: device.label,
            deviceId: device.deviceId
          }));
        }).catch(() => {
          // Media devices API not available
        });
      }

      // WebGL information
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          metadata.webgl = {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          };
        }
      }

      // Canvas fingerprinting
      const canvas2d = document.createElement('canvas');
      const ctx = canvas2d.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        metadata.canvasFingerprint = canvas2d.toDataURL();
      }

      // Timezone and locale information
      metadata.locale = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        numberFormat: Intl.NumberFormat().resolvedOptions().locale,
        dateTimeFormat: Intl.DateTimeFormat().resolvedOptions().locale
      };

      // Screen orientation
      if (screen.orientation) {
        metadata.screenOrientation = {
          angle: screen.orientation.angle,
          type: screen.orientation.type
        };
      }

      // Page visibility
      metadata.pageVisibility = {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      };

    } catch (error) {
      console.warn('Error collecting additional metadata:', error);
    }

    return metadata;
  }

  /**
   * Gets a simple browser fingerprint for identification purposes
   */
  public static getBrowserFingerprint(): string {
    const metadata = this.getBrowserMetadata();
    const additional = this.getAdditionalMetadata();
    
    // Create a simple fingerprint from key characteristics
    const fingerprintData = {
      platform: metadata.platform,
      browser: metadata.browserName,
      language: metadata.language,
      screen: `${metadata.screenWidth}x${metadata.screenHeight}`,
      timezone: metadata.timezone,
      hardwareConcurrency: metadata.hardwareConcurrency,
      maxTouchPoints: metadata.maxTouchPoints,
      devicePixelRatio: metadata.devicePixelRatio,
      webgl: additional.webgl?.renderer || 'unknown'
    };
    
    // Create a simple hash-like string
    return btoa(JSON.stringify(fingerprintData)).substring(0, 32);
  }

  /**
   * Checks if the browser supports modern features
   */
  public static getBrowserCapabilities(): Record<string, boolean> {
    return {
      userAgentData: 'userAgentData' in navigator,
      highEntropyValues: 'userAgentData' in navigator && 'getHighEntropyValues' in (navigator as any).userAgentData,
      webGL: !!document.createElement('canvas').getContext('webgl'),
      webGL2: !!document.createElement('canvas').getContext('webgl2'),
      touchEvents: 'ontouchstart' in window,
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      mediaDevices: 'mediaDevices' in navigator,
      battery: 'getBattery' in navigator,
      connection: 'connection' in navigator,
      memory: 'memory' in performance,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notifications: 'Notification' in window,
      clipboard: 'clipboard' in navigator,
      share: 'share' in navigator,
      webShare: 'canShare' in navigator
    };
  }
}
