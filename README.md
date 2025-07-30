# 🎵 Latte Music

A beautiful, modern React web application that visualizes your Spotify listening habits with stunning 3D animations and an intuitive user interface.

## ✨ Features

- **🎯 Top Tracks Visualization**: Display your most played 30 tracks with beautiful album artwork
- **🎮 3D Animations**: Smooth 3D card effects and transitions using anime.js
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **🔐 Secure Authentication**: OAuth 2.0 with PKCE flow for Spotify integration
- **⚡ Performance Optimized**: Rate limiting, caching, and lazy loading for optimal performance
- **🎨 Modern UI/UX**: Clean, Spotify-inspired design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Spotify Developer Account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd latte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   - Create a new app
   - Add `http://127.0.0.1:5173/callback` to Redirect URIs
   - Note your Client ID

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Spotify credentials:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`
