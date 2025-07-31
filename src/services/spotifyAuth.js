import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '../constants/spotify';

class SpotifyAuthService {
  constructor() {
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
    this.tokenExpiry = localStorage.getItem('spotify_token_expiry');
  }

  // Generate random string for state parameter
  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  // Generate code challenge for PKCE
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  // Redirect to Spotify authorization
  async redirectToSpotifyAuth() {
    // Clear any existing auth data first
    this.logout();

    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(16);

    console.log('Starting OAuth flow:', {
      state,
      codeVerifier: codeVerifier.substring(0, 10) + '...',
      redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
      clientId: SPOTIFY_CONFIG.CLIENT_ID
    });

    // Store code verifier for later use
    console.log('💾 Storing auth data in localStorage:', {
      codeVerifier: codeVerifier.substring(0, 10) + '...',
      state,
      timestamp: new Date().toISOString()
    });

    // Use both localStorage and sessionStorage for redundancy
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    localStorage.setItem('spotify_state', state);
    localStorage.setItem('spotify_auth_timestamp', Date.now().toString());

    // Backup in sessionStorage
    sessionStorage.setItem('spotify_code_verifier_backup', codeVerifier);
    sessionStorage.setItem('spotify_state_backup', state);

    // Verify storage
    console.log('✅ Verification - stored values:', {
      storedCodeVerifier: localStorage.getItem('spotify_code_verifier')?.substring(0, 10) + '...',
      storedState: localStorage.getItem('spotify_state'),
      storedTimestamp: localStorage.getItem('spotify_auth_timestamp')
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      scope: SPOTIFY_CONFIG.SCOPES,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    const authUrl = `${SPOTIFY_ENDPOINTS.AUTHORIZE}?${params.toString()}`;
    console.log('Redirecting to:', authUrl);

    window.location.href = authUrl;
  }

  // Handle callback and exchange code for token
  async handleCallback(code, state) {
    // Prevent duplicate processing
    if (this.isProcessingCallback) {
      console.log('⚠️ Callback already being processed, skipping...');
      return false;
    }

    this.isProcessingCallback = true;

    try {
      console.log('🔄 Starting callback handling...');
      console.log('📥 Received parameters:', { code: code?.substring(0, 10) + '...', state });

      const storedState = localStorage.getItem('spotify_state');
    let codeVerifier = localStorage.getItem('spotify_code_verifier');

    // If not found in localStorage, try sessionStorage backup
    if (!codeVerifier) {
      console.log('⚠️ Code verifier not found in localStorage, checking sessionStorage backup...');
      codeVerifier = sessionStorage.getItem('spotify_code_verifier_backup');
      if (codeVerifier) {
        console.log('✅ Found code verifier in sessionStorage backup');
      }
    }

    console.log('💾 LocalStorage contents:', {
      storedState,
      codeVerifier: codeVerifier ? codeVerifier.substring(0, 10) + '...' : null,
      allKeys: Object.keys(localStorage).filter(key => key.startsWith('spotify_'))
    });

    console.log('State verification:', { storedState, receivedState: state });

    if (state !== storedState) {
      console.error('State mismatch:', { stored: storedState, received: state });
      console.warn('State mismatch detected - this could be a security issue');

      // In production, this would be a security issue, but in development we can be more lenient
      if (import.meta.env.PROD) {
        throw new Error('State mismatch detected - potential security issue');
      } else {
        console.warn('⚠️ State mismatch in development mode - continuing anyway');
      }
    }

    if (!codeVerifier) {
      console.error('❌ Code verifier not found in localStorage');
      console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
      throw new Error('Code verifier not found. Please try logging in again.');
    }

      console.log('✅ Code verifier found, proceeding with token exchange...');

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        client_id: SPOTIFY_CONFIG.CLIENT_ID,
        code_verifier: codeVerifier,
      });

      console.log('Token exchange request:', {
        url: SPOTIFY_ENDPOINTS.TOKEN,
        params: Object.fromEntries(params.entries())
      });

      const response = await fetch(SPOTIFY_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      console.log('Token exchange response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange error response:', errorData);
        throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      this.setTokens(data);

      // Clean up stored values
      localStorage.removeItem('spotify_code_verifier');
      localStorage.removeItem('spotify_state');
      localStorage.removeItem('spotify_auth_timestamp');

      // Clean up sessionStorage backups
      sessionStorage.removeItem('spotify_code_verifier_backup');
      sessionStorage.removeItem('spotify_state_backup');

      console.log('🧹 Cleaned up auth storage after successful token exchange');

      return true; // Return success
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false; // Return failure instead of throwing
    } finally {
      this.isProcessingCallback = false;
    }
  }

  // Set tokens in memory and localStorage
  setTokens(tokenData) {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

    localStorage.setItem('spotify_access_token', this.accessToken);
    localStorage.setItem('spotify_refresh_token', this.refreshToken);
    localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
  }

  // Check if token is valid
  isTokenValid() {
    return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
    });

    try {
      const response = await fetch(SPOTIFY_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens({
        ...data,
        refresh_token: this.refreshToken, // Keep existing refresh token if not provided
      });

      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken() {
    if (this.isTokenValid()) {
      return this.accessToken;
    }

    if (this.refreshToken) {
      await this.refreshAccessToken();
      return this.accessToken;
    }

    throw new Error('No valid token available');
  }

  // Logout user
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_state');
    localStorage.removeItem('spotify_auth_timestamp');

    // Clean up sessionStorage backups
    sessionStorage.removeItem('spotify_code_verifier_backup');
    sessionStorage.removeItem('spotify_state_backup');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isTokenValid() || !!this.refreshToken;
  }
}

export default new SpotifyAuthService();
