const validator = require('validator');

/**
 * Input validation middleware for security
 */

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potential XSS characters
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();
};

// Validate email format
const isValidEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

// Validate Spotify ID format
const isValidSpotifyId = (spotifyId) => {
  return typeof spotifyId === 'string' && 
         spotifyId.length > 0 && 
         spotifyId.length <= 50 &&
         /^[a-zA-Z0-9_-]+$/.test(spotifyId);
};

// Validate display name
const isValidDisplayName = (displayName) => {
  return typeof displayName === 'string' && 
         displayName.trim().length >= 1 && 
         displayName.length <= 100;
};

// Validate URL format
const isValidUrl = (url) => {
  if (!url) return true; // Optional field
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// Validate country code
const isValidCountryCode = (country) => {
  if (!country) return true; // Optional field
  return typeof country === 'string' && 
         country.length === 2 && 
         /^[A-Z]{2}$/.test(country);
};



// Spotify authentication validation
const validateSpotifyAuth = (req, res, next) => {
  try {
    const { spotifyId, email, displayName, profileImage, country, followers } = req.body;

    // Required fields validation
    if (!spotifyId || !isValidSpotifyId(spotifyId)) {
      return res.status(400).json({ 
        message: 'Invalid or missing Spotify ID' 
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid or missing email address' 
      });
    }

    if (!displayName || !isValidDisplayName(displayName)) {
      return res.status(400).json({ 
        message: 'Invalid or missing display name' 
      });
    }

    // Optional fields validation
    if (profileImage && !isValidUrl(profileImage)) {
      return res.status(400).json({ 
        message: 'Invalid profile image URL' 
      });
    }

    if (country && !isValidCountryCode(country)) {
      return res.status(400).json({ 
        message: 'Invalid country code' 
      });
    }

    if (followers !== undefined && (typeof followers !== 'number' || followers < 0)) {
      return res.status(400).json({ 
        message: 'Invalid followers count' 
      });
    }

    // Sanitize string inputs
    req.body.displayName = sanitizeString(displayName);
    req.body.email = sanitizeString(email);
    
    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Validation failed' });
  }
};

// Profile update validation
const validateProfileUpdate = (req, res, next) => {
  try {
    const { displayName, privacy, settings } = req.body;

    if (displayName !== undefined) {
      if (!isValidDisplayName(displayName)) {
        return res.status(400).json({ 
          message: 'Invalid display name' 
        });
      }
      req.body.displayName = sanitizeString(displayName);
    }

    if (privacy !== undefined) {
      if (typeof privacy !== 'object' || privacy === null) {
        return res.status(400).json({ 
          message: 'Invalid privacy settings format' 
        });
      }
      
      // Validate privacy settings structure
      const allowedPrivacyKeys = [
        'allowComparison', 'showProfile', 'showTopTracks', 
        'showTopArtists', 'allowFriendRequests'
      ];
      
      for (const key of Object.keys(privacy)) {
        if (!allowedPrivacyKeys.includes(key)) {
          return res.status(400).json({ 
            message: `Invalid privacy setting: ${key}` 
          });
        }
        
        if (typeof privacy[key] !== 'boolean') {
          return res.status(400).json({ 
            message: `Privacy setting ${key} must be boolean` 
          });
        }
      }
    }

    if (settings !== undefined) {
      if (typeof settings !== 'object' || settings === null) {
        return res.status(400).json({ 
          message: 'Invalid settings format' 
        });
      }
      
      // Validate settings structure
      const allowedSettingsKeys = ['language', 'theme'];
      const allowedLanguages = ['en', 'tr'];
      const allowedThemes = ['light', 'dark'];
      
      for (const key of Object.keys(settings)) {
        if (!allowedSettingsKeys.includes(key)) {
          return res.status(400).json({ 
            message: `Invalid setting: ${key}` 
          });
        }
        
        if (key === 'language' && !allowedLanguages.includes(settings[key])) {
          return res.status(400).json({ 
            message: 'Invalid language setting' 
          });
        }
        
        if (key === 'theme' && !allowedThemes.includes(settings[key])) {
          return res.status(400).json({ 
            message: 'Invalid theme setting' 
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Profile validation error:', error);
    res.status(500).json({ message: 'Profile validation failed' });
  }
};



// Rate limiting per user
const createUserRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    const userId = req.userId || req.ip;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userLimit = userRequests.get(userId);
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }
    
    if (userLimit.count >= max) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.' 
      });
    }
    
    userLimit.count++;
    next();
  };
};

// Friend request validation
const validateFriendRequest = (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!Number.isInteger(parseInt(userId)) || parseInt(userId) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    next();
  } catch (error) {
    console.error('Friend request validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Friend request validation failed'
    });
  }
};

// User ID validation for params
const validateUserId = (req, res, next) => {
  try {
    const { friendId, userId } = req.params;
    const id = friendId || userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!Number.isInteger(parseInt(id)) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    next();
  } catch (error) {
    console.error('User ID validation error:', error);
    res.status(500).json({
      success: false,
      message: 'User ID validation failed'
    });
  }
};

module.exports = {
  validateSpotifyAuth,
  validateProfileUpdate,
  validateFriendRequest,
  validateUserId,

  createUserRateLimit,
  sanitizeString,
  isValidEmail,
  isValidSpotifyId,
  isValidDisplayName,
  isValidUrl
};
