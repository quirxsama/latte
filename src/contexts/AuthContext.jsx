import React, { createContext, useContext, useEffect, useState } from 'react';
import spotifyAuth from '../services/spotifyAuth';
import spotifyApi from '../services/spotifyApi';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();

    // Test mode premium simulation
    const testMode = localStorage.getItem('latte_test_mode');
    const testPremium = localStorage.getItem('latte_test_premium');
    if (testMode === 'true') {
      setIsAuthenticated(true);
      setUser({
        id: 'test_user',
        displayName: 'Test User',
        email: 'test@example.com',
        profileImage: null
      });
      if (testPremium === 'true') {
        setIsPremium(true);
      }
      console.log('🧪 Test mode: User authenticated and premium simulated');
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have a backend auth token
      const backendToken = apiService.getAuthToken();

      if (backendToken) {
        try {
          // Try to get user profile from backend first
          const backendProfile = await apiService.getProfile();
          setUser(backendProfile.user);
          setIsAuthenticated(true);
          console.log('✅ Backend auth check successful');
          return;
        } catch (backendError) {
          console.warn('⚠️ Backend auth check failed:', backendError.message);
          // Remove invalid backend token
          localStorage.removeItem('latte_auth_token');
        }
      }

      // Fallback to Spotify auth check
      if (spotifyAuth.isAuthenticated()) {
        try {
          // Try to fetch user profile from Spotify
          const spotifyProfile = await spotifyApi.getUserProfile();

          // Try to sync with backend
          try {
            const backendResponse = await apiService.authenticateWithSpotify({
              spotifyId: spotifyProfile.id,
              email: spotifyProfile.email,
              displayName: spotifyProfile.display_name,
              profileImage: spotifyProfile.images?.[0]?.url,
              country: spotifyProfile.country,
              followers: spotifyProfile.followers?.total || 0
            });

            setUser(backendResponse.user);
            console.log('✅ Spotify auth + backend sync successful');
          } catch (syncError) {
            console.warn('⚠️ Backend sync failed, using Spotify profile only:', syncError.message);
            setUser(spotifyProfile);
          }

          setIsAuthenticated(true);
        } catch (spotifyError) {
          console.error('Spotify auth check failed:', spotifyError);
          throw spotifyError;
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed');
      setIsAuthenticated(false);
      setUser(null);
      // Clear invalid tokens
      spotifyAuth.logout();
      localStorage.removeItem('latte_auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      await spotifyAuth.redirectToSpotifyAuth();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handleCallback = async (code, state) => {
    try {
      setLoading(true);
      setError(null);

      await spotifyAuth.handleCallback(code, state);

      // Fetch user profile from Spotify
      const spotifyProfile = await spotifyApi.getUserProfile();

      // Check if user has premium (including all premium types)
      console.log('🎵 Spotify user product type:', spotifyProfile.product);
      console.log('🎵 Full Spotify user profile:', spotifyProfile);

      // Check for various premium types that Spotify API might return
      // Note: Family Premium usually returns just "premium" in the API
      const premiumTypes = [
        'premium',         // Individual, Family, Student, Duo all return this
        'premium-family',
        'premium-student',
        'premium-duo',
        'premium_family',  // underscore variant
        'premium_student',
        'premium_duo'
      ];

      // Also check if product contains 'premium' (case insensitive)
      const productLower = (spotifyProfile.product || '').toLowerCase();
      const userIsPremium = premiumTypes.includes(productLower) ||
                           productLower.includes('premium') ||
                           productLower !== 'free'; // Anything that's not 'free' is likely premium

      setIsPremium(userIsPremium);
      console.log(`🎵 User premium status: ${userIsPremium ? 'Premium' : 'Free'} (Product: ${spotifyProfile.product})`);

      // Send user data to backend for authentication/registration
      try {
        const backendResponse = await apiService.authenticateWithSpotify({
          spotifyId: spotifyProfile.id,
          email: spotifyProfile.email,
          displayName: spotifyProfile.display_name,
          profileImage: spotifyProfile.images?.[0]?.url,
          country: spotifyProfile.country,
          followers: spotifyProfile.followers?.total || 0
        });

        // Use backend user data (includes additional fields like settings, etc.)
        setUser(backendResponse.user);
        setIsAuthenticated(true);

        console.log('✅ Authentication successful:', backendResponse.user.displayName);
        console.log('🔗 Backend integration successful');

        // Check for Spotify friends after successful authentication
        try {
          console.log('🔍 Checking for Spotify friends...');
          const friendsResult = await apiService.checkSpotifyFriends();
          if (friendsResult.addedCount > 0) {
            console.log(`👥 Found and sent friend requests to ${friendsResult.addedCount} potential friends`);
          } else {
            console.log('👥 No new potential friends found');
          }
        } catch (friendsError) {
          console.warn('⚠️ Failed to check Spotify friends:', friendsError.message);
          // Don't fail the authentication if friend checking fails
        }

        return true;
      } catch (backendError) {
        console.warn('⚠️ Backend authentication failed, using Spotify profile only:', backendError.message);

        // Fallback to Spotify profile if backend fails
        setUser(spotifyProfile);
        setIsAuthenticated(true);

        console.log('✅ Authentication successful (Spotify only):', spotifyProfile.display_name);

        return true;
      }
    } catch (error) {
      console.error('Callback handling failed:', error);
      setError('Authentication failed. Please try again.');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear Spotify auth
    spotifyAuth.logout();

    // Clear backend auth token
    localStorage.removeItem('latte_auth_token');

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    setError(null);

    console.log('🚪 Logout successful');
  };



  const refreshAuth = async () => {
    try {
      // Try to refresh backend auth first
      const backendToken = apiService.getAuthToken();
      if (backendToken) {
        try {
          const backendProfile = await apiService.getProfile();
          setUser(backendProfile.user);
          setIsAuthenticated(true);
          setError(null);
          return;
        } catch (backendError) {
          console.warn('⚠️ Backend refresh failed:', backendError.message);
          localStorage.removeItem('latte_auth_token');
        }
      }

      // Fallback to Spotify refresh
      await spotifyAuth.refreshAccessToken();
      const spotifyProfile = await spotifyApi.getUserProfile();

      // Try to sync with backend
      try {
        const backendResponse = await apiService.authenticateWithSpotify({
          spotifyId: spotifyProfile.id,
          email: spotifyProfile.email,
          displayName: spotifyProfile.display_name,
          profileImage: spotifyProfile.images?.[0]?.url,
          country: spotifyProfile.country,
          followers: spotifyProfile.followers?.total || 0
        });

        setUser(backendResponse.user);
      } catch (syncError) {
        console.warn('⚠️ Backend sync failed during refresh:', syncError.message);
        setUser(spotifyProfile);
      }

      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);

      const backendToken = apiService.getAuthToken();
      if (backendToken) {
        const response = await apiService.updateProfile(profileData);
        setUser(prevUser => ({ ...prevUser, ...response.user }));
        console.log('✅ Profile updated successfully');
        return response;
      } else {
        throw new Error('No backend authentication available');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile');
      throw error;
    }
  };

  // Update music statistics
  const updateMusicStats = async (musicData) => {
    try {
      setError(null);

      const backendToken = apiService.getAuthToken();
      if (backendToken) {
        await apiService.updateMusicStats(musicData);
        console.log('✅ Music stats updated successfully');
      } else {
        console.warn('⚠️ No backend authentication, music stats not saved');
      }
    } catch (error) {
      console.error('Music stats update failed:', error);
      // Don't set error state for music stats as it's not critical
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    isPremium,
    login,
    logout,
    handleCallback,
    refreshAuth,
    checkAuthStatus,
    updateProfile,
    updateMusicStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
