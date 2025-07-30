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

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      if (spotifyAuth.isAuthenticated()) {
        // Try to fetch user profile from Spotify
        const userProfile = await spotifyApi.getUserProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
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

      // For now, just use Spotify profile directly (no backend)
      setUser(spotifyProfile);
      setIsAuthenticated(true);

      console.log('✅ Authentication successful:', spotifyProfile.display_name);

      return true;
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
    spotifyAuth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };



  const refreshAuth = async () => {
    try {
      await spotifyAuth.refreshAccessToken();
      const userProfile = await spotifyApi.getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    handleCallback,
    refreshAuth,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
