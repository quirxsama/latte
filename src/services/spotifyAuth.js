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
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    localStorage.setItem('spotify_state', state);

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
    const storedState = localStorage.getItem('spotify_state');
    const codeVerifier = localStorage.getItem('spotify_code_verifier');

    console.log('State verification:', { storedState, receivedState: state });

    if (state !== storedState) {
      console.error('State mismatch:', { stored: storedState, received: state });
      console.warn('State mismatch detected - this could be a security issue');
      // Don't clear code_verifier yet, we still need it for token exchange
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found. Please try logging in again.');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      code_verifier: codeVerifier,
    });

    try {
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

      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
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
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isTokenValid() || !!this.refreshToken;
  }
}

export default new SpotifyAuthService();
