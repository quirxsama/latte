// Performance optimization utilities

// Debounce function for limiting API calls
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility for images
export const createLazyImageObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
  };

  const observerOptions = { ...defaultOptions, ...options };

  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    return {
      observe: (element) => callback(element),
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, observerOptions);
};

// Preload images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Batch preload multiple images
export const preloadImages = async (urls, onProgress = null) => {
  const results = [];
  let loaded = 0;

  for (const url of urls) {
    try {
      const img = await preloadImage(url);
      results.push({ url, img, success: true });
    } catch (error) {
      results.push({ url, error, success: false });
    }
    
    loaded++;
    if (onProgress) {
      onProgress(loaded, urls.length, loaded / urls.length);
    }
  }

  return results;
};

// Memory management for large lists
export const createVirtualList = (items, containerHeight, itemHeight) => {
  const getVisibleRange = (scrollTop) => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    
    return {
      start: Math.max(0, start - 1),
      end,
      visibleItems: items.slice(Math.max(0, start - 1), end),
    };
  };

  return { getVisibleRange };
};

// Rate limiting for API calls
export class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    return this.requests.length < this.maxRequests;
  }

  makeRequest() {
    if (!this.canMakeRequest()) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (Date.now() - oldestRequest);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requests.push(Date.now());
    return true;
  }

  getWaitTime() {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

// Cache implementation for API responses
export class SimpleCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Performance monitoring
export const performanceMonitor = {
  marks: new Map(),
  
  mark(name) {
    this.marks.set(name, performance.now());
  },
  
  measure(name, startMark) {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return null;
    }
    
    const duration = performance.now() - startTime;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  },
  
  measureSince(name, startMark) {
    const duration = this.measure(name, startMark);
    this.marks.delete(startMark);
    return duration;
  }
};

// Bundle size optimization helpers
export const loadComponentLazily = (importFunc) => {
  return React.lazy(() => 
    importFunc().then(module => ({
      default: module.default || module
    }))
  );
};

// Memory leak prevention
export const createCleanupManager = () => {
  const cleanupFunctions = [];
  
  return {
    add: (cleanupFn) => {
      cleanupFunctions.push(cleanupFn);
    },
    
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup function failed:', error);
        }
      });
      cleanupFunctions.length = 0;
    }
  };
};

// Optimize animations for performance
export const optimizeAnimation = (element, property, fromValue, toValue, duration = 300) => {
  // Use requestAnimationFrame for smooth animations
  const startTime = performance.now();
  const startValue = parseFloat(fromValue);
  const endValue = parseFloat(toValue);
  const difference = endValue - startValue;

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (difference * easeOut);
    
    element.style[property] = `${currentValue}${property === 'opacity' ? '' : 'px'}`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Network status monitoring
export const networkMonitor = {
  isOnline: navigator.onLine,
  connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
  
  getConnectionInfo() {
    if (!this.connection) return null;
    
    return {
      effectiveType: this.connection.effectiveType,
      downlink: this.connection.downlink,
      rtt: this.connection.rtt,
      saveData: this.connection.saveData,
    };
  },
  
  isSlowConnection() {
    const info = this.getConnectionInfo();
    return info && (info.effectiveType === 'slow-2g' || info.effectiveType === '2g');
  },
  
  shouldReduceQuality() {
    return this.isSlowConnection() || (this.connection && this.connection.saveData);
  }
};

// Error boundary helper
export const createErrorHandler = (componentName) => {
  return (error, errorInfo) => {
    console.error(`Error in ${componentName}:`, error);
    console.error('Error info:', errorInfo);
    
    // You can send error reports to a service here
    // Example: sendErrorReport(error, errorInfo, componentName);
  };
};
