class SpotifyPlayer {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.isReady = false;
    this.currentTrack = null;
    this.isPlaying = false;
    this.position = 0;
    this.duration = 0;
    this.volume = 0.5;
    this.listeners = new Map();
  }

  // Initialize the Spotify Web Playback SDK
  async initialize(accessToken) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    return new Promise((resolve, reject) => {
      // Load Spotify Web Playback SDK
      if (!window.Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
          this.createPlayer(accessToken, resolve, reject);
        };
      } else {
        this.createPlayer(accessToken, resolve, reject);
      }
    });
  }

  createPlayer(accessToken, resolve, reject) {
    this.player = new window.Spotify.Player({
      name: 'Latte Music Player',
      getOAuthToken: cb => { cb(accessToken); },
      volume: this.volume
    });

    // Error handling
    this.player.addListener('initialization_error', ({ message }) => {
      console.error('Failed to initialize:', message);
      reject(new Error(message));
    });

    this.player.addListener('authentication_error', ({ message }) => {
      console.error('Failed to authenticate:', message);
      reject(new Error(message));
    });

    this.player.addListener('account_error', ({ message }) => {
      console.error('Failed to validate Spotify account:', message);
      reject(new Error(message));
    });

    this.player.addListener('playback_error', ({ message }) => {
      console.error('Failed to perform playback:', message);
      this.emit('error', new Error(message));
    });

    // Playback status updates
    this.player.addListener('player_state_changed', (state) => {
      if (!state) return;

      this.currentTrack = state.track_window.current_track;
      this.isPlaying = !state.paused;
      this.position = state.position;
      this.duration = state.duration;

      this.emit('stateChanged', {
        track: this.currentTrack,
        isPlaying: this.isPlaying,
        position: this.position,
        duration: this.duration
      });
    });

    // Ready
    this.player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      this.deviceId = device_id;
      this.isReady = true;
      resolve(device_id);
    });

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      this.isReady = false;
    });

    // Connect to the player
    this.player.connect();
  }

  // Play a track by URI
  async playTrack(trackUri, accessToken, positionMs = 0) {
    if (!this.isReady || !this.deviceId) {
      throw new Error('Player not ready');
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: positionMs
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }

  // Play a preview snippet (5 seconds)
  async playPreview(trackUri, accessToken) {
    await this.playTrack(trackUri, accessToken);
    
    // Stop after 5 seconds
    setTimeout(() => {
      this.pause();
    }, 5000);
  }

  // Pause playback
  async pause() {
    if (this.player) {
      await this.player.pause();
    }
  }

  // Resume playback
  async resume() {
    if (this.player) {
      await this.player.resume();
    }
  }

  // Stop playback
  async stop() {
    if (this.player) {
      await this.player.pause();
      await this.seek(0);
    }
  }

  // Seek to position
  async seek(positionMs) {
    if (this.player) {
      await this.player.seek(positionMs);
    }
  }

  // Set volume (0.0 to 1.0)
  async setVolume(volume) {
    if (this.player) {
      this.volume = Math.max(0, Math.min(1, volume));
      await this.player.setVolume(this.volume);
    }
  }

  // Get current state
  async getCurrentState() {
    if (this.player) {
      return await this.player.getCurrentState();
    }
    return null;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Disconnect player
  disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
      this.deviceId = null;
      this.isReady = false;
    }
  }

  // Check if user has Spotify Premium
  async checkPremiumStatus(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const user = await response.json();
      return user.product === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }
}

// Create singleton instance
const spotifyPlayer = new SpotifyPlayer();

export default spotifyPlayer;
