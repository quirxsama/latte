/**
 * Frontend Security Utilities
 */

// XSS Protection - Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
      localStorage.setItem(sanitizedKey, JSON.stringify(sanitizedValue));
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },

  getItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const item = localStorage.getItem(sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  }
};

// Content Security Policy helper
export const isCSPCompliant = (content) => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /Function\(/i,
    /setTimeout\(/i,
    /setInterval\(/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
};

// Rate limiting for client-side actions
export class ClientRateLimit {
  constructor(windowMs = 60000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  isAllowed(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    return true;
  }

  getRemainingRequests(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key = 'default') {
    const userRequests = this.requests.get(key) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

// Input validation helpers
export const validators = {
  displayName: (name) => {
    if (typeof name !== 'string') return false;
    const sanitized = sanitizeInput(name);
    return sanitized.length >= 1 && sanitized.length <= 100;
  },



  spotifyId: (id) => {
    if (typeof id !== 'string') return false;
    return id.length > 0 && id.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(id);
  },

  country: (country) => {
    if (!country) return true; // Optional
    return typeof country === 'string' && 
           country.length === 2 && 
           /^[A-Z]{2}$/.test(country);
  }
};

// Secure form data handler
export const secureFormData = (formData) => {
  const secured = {};
  
  for (const [key, value] of Object.entries(formData)) {
    const sanitizedKey = sanitizeInput(key);
    
    if (typeof value === 'string') {
      secured[sanitizedKey] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      secured[sanitizedKey] = value;
    } else if (Array.isArray(value)) {
      secured[sanitizedKey] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      secured[sanitizedKey] = secureFormData(value);
    } else {
      secured[sanitizedKey] = value;
    }
  }
  
  return secured;
};

// Environment variable validation
export const validateEnvVars = () => {
  const required = [
    'VITE_SPOTIFY_CLIENT_ID',
    'VITE_SPOTIFY_REDIRECT_URI',
    'VITE_API_BASE_URL'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  // Validate Spotify Client ID format
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  if (!/^[a-f0-9]{32}$/.test(clientId)) {
    console.warn('Spotify Client ID format appears invalid');
  }

  // Validate redirect URI
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (!isValidUrl(redirectUri)) {
    console.error('Invalid Spotify redirect URI');
    return false;
  }

  // Validate API base URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!isValidUrl(apiUrl)) {
    console.error('Invalid API base URL');
    return false;
  }

  return true;
};

// Security headers check (for development)
export const checkSecurityHeaders = async (url = window.location.origin) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = response.headers;
    
    const securityHeaders = {
      'x-frame-options': headers.get('x-frame-options'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-xss-protection': headers.get('x-xss-protection'),
      'strict-transport-security': headers.get('strict-transport-security'),
      'content-security-policy': headers.get('content-security-policy'),
      'referrer-policy': headers.get('referrer-policy')
    };

    console.log('Security Headers:', securityHeaders);
    return securityHeaders;
  } catch (error) {
    console.error('Failed to check security headers:', error);
    return null;
  }
};

// Initialize security checks
export const initSecurity = () => {
  // Validate environment variables
  if (!validateEnvVars()) {
    console.error('Security initialization failed: Invalid environment variables');
    return false;
  }

  // Check if running in development
  if (import.meta.env.DEV) {
    console.log('🔒 Security utilities initialized (Development mode)');
    
    // Check security headers in development
    checkSecurityHeaders().then(headers => {
      if (headers) {
        const missingHeaders = Object.entries(headers)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
        
        if (missingHeaders.length > 0) {
          console.warn('Missing security headers:', missingHeaders);
        }
      }
    });
  }

  return true;
};

// Export rate limiter instances for common use cases
export const rateLimiters = {
  api: new ClientRateLimit(60000, 30), // 30 API calls per minute

  auth: new ClientRateLimit(900000, 3), // 3 auth attempts per 15 minutes
  search: new ClientRateLimit(60000, 20), // 20 searches per minute
};
