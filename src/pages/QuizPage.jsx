import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../constants/spotify';
import { useAuth } from '../contexts/AuthContext';
import spotifyApi from '../services/spotifyApi';
import spotifyPlayer from '../services/spotifyPlayer';
import Header from '../components/common/Header';
import MusicQuiz from '../components/quiz/MusicQuiz';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.SPOTIFY_BLACK} 0%, ${UI_CONFIG.COLORS.SPOTIFY_DARK_GRAY} 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MainContent = styled.main`
  padding-top: ${UI_CONFIG.SPACING.XL};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${UI_CONFIG.SPACING.XL};
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #ff4757;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
`;

const ErrorMessage = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
`;

const QuizPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, loading: authLoading, accessToken } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Fetch tracks for quiz (mix of different time ranges for variety)
  const fetchQuizTracks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tracks from different time ranges for variety - fetch more to increase chances
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        spotifyApi.getTopTracks('short_term', 50, 0).catch(() => ({ items: [] })),
        spotifyApi.getTopTracks('medium_term', 50, 0).catch(() => ({ items: [] })),
        spotifyApi.getTopTracks('long_term', 50, 0).catch(() => ({ items: [] }))
      ]);

      // Combine and deduplicate tracks
      const allTracks = [
        ...shortTerm.items,
        ...mediumTerm.items,
        ...longTerm.items
      ];

      // Remove duplicates first
      const uniqueTracks = allTracks.reduce((acc, track) => {
        if (!acc.find(t => t.id === track.id)) {
          acc.push(track);
        }
        return acc;
      }, []);

      if (isPremium && playerReady) {
        // Premium users can play any track
        if (uniqueTracks.length < 4) {
          setError(t('quiz.errors.notEnoughTracks', 'Not enough tracks available for the quiz.'));
          return;
        }

        // Shuffle and take first 10 tracks for quiz
        const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
        setTracks(shuffled.slice(0, 10));
      } else {
        // Free users or Premium without player: Use tracks with preview URLs
        const tracksWithPreview = uniqueTracks.filter(track => track.preview_url);

        if (tracksWithPreview.length < 4) {
          // If not enough preview tracks, try to get more from popular tracks
          try {
            console.log(`Only ${tracksWithPreview.length} tracks with preview found, fetching more...`);

            // Get more tracks from different offsets
            const [moreShort, moreMedium, moreLong] = await Promise.all([
              spotifyApi.getTopTracks('short_term', 50, 50).catch(() => ({ items: [] })),
              spotifyApi.getTopTracks('medium_term', 50, 50).catch(() => ({ items: [] })),
              spotifyApi.getTopTracks('long_term', 50, 50).catch(() => ({ items: [] }))
            ]);

            const moreAllTracks = [
              ...moreShort.items,
              ...moreMedium.items,
              ...moreLong.items
            ];

            // Add new tracks that aren't already in our list
            const additionalTracks = moreAllTracks.filter(track =>
              !uniqueTracks.find(t => t.id === track.id) && track.preview_url
            );

            const finalTracksWithPreview = [...tracksWithPreview, ...additionalTracks];

            if (finalTracksWithPreview.length < 4) {
              // Last resort: Try to get saved tracks (liked songs)
              try {
                console.log('Trying saved tracks as last resort...');
                const savedTracks = await spotifyApi.api.get('/me/tracks', {
                  params: { limit: 50 }
                }).catch(() => ({ data: { items: [] } }));

                const savedTracksWithPreview = savedTracks.data.items
                  .map(item => item.track)
                  .filter(track => track.preview_url && !finalTracksWithPreview.find(t => t.id === track.id));

                const allAvailableTracks = [...finalTracksWithPreview, ...savedTracksWithPreview];

                if (allAvailableTracks.length < 4) {
                  // Final fallback: Use popular tracks from featured playlists
                  try {
                    console.log('Trying featured playlists as final fallback...');
                    const featuredPlaylists = await spotifyApi.api.get('/browse/featured-playlists', {
                      params: { limit: 5 }
                    }).catch(() => ({ data: { playlists: { items: [] } } }));

                    let fallbackTracks = [];

                    // Get tracks from first featured playlist
                    if (featuredPlaylists.data.playlists.items.length > 0) {
                      const playlistId = featuredPlaylists.data.playlists.items[0].id;
                      const playlistTracks = await spotifyApi.api.get(`/playlists/${playlistId}/tracks`, {
                        params: { limit: 20 }
                      }).catch(() => ({ data: { items: [] } }));

                      fallbackTracks = playlistTracks.data.items
                        .map(item => item.track)
                        .filter(track => track && track.preview_url)
                        .slice(0, 10);
                    }

                    if (fallbackTracks.length >= 4) {
                      console.log(`Using ${fallbackTracks.length} tracks from featured playlist`);
                      const shuffled = fallbackTracks.sort(() => 0.5 - Math.random());
                      setTracks(shuffled.slice(0, Math.min(10, fallbackTracks.length)));
                      return;
                    }
                  } catch (playlistError) {
                    console.error('Error fetching featured playlists:', playlistError);
                  }

                  setError(t('quiz.errors.notEnoughTracksWithPreview', 'Not enough tracks with preview available for the quiz. You need at least 4 tracks with audio previews.'));
                  return;
                }

                // Use all available tracks
                const shuffled = allAvailableTracks.sort(() => 0.5 - Math.random());
                setTracks(shuffled.slice(0, Math.min(10, allAvailableTracks.length)));
                return;
              } catch (savedError) {
                console.error('Error fetching saved tracks:', savedError);
                setError(t('quiz.errors.notEnoughTracksWithPreview', 'Not enough tracks with preview available for the quiz. You need at least 4 tracks with audio previews.'));
                return;
              }
            }

            // Shuffle and take first 10 tracks for quiz
            const shuffled = finalTracksWithPreview.sort(() => 0.5 - Math.random());
            setTracks(shuffled.slice(0, 10));
          } catch (error) {
            setError(t('quiz.errors.notEnoughTracksWithPreview', 'Not enough tracks with preview available for the quiz. You need at least 4 tracks with audio previews.'));
            return;
          }
        } else {
          // Shuffle and take first 10 tracks for quiz
          const shuffled = tracksWithPreview.sort(() => 0.5 - Math.random());
          setTracks(shuffled.slice(0, 10));
        }
      }

    } catch (err) {
      console.error('Error fetching quiz tracks:', err);
      setError('Failed to load tracks for the quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Spotify Player
  useEffect(() => {
    const initializePlayer = async () => {
      if (isAuthenticated && accessToken) {
        try {
          // Check if user has Spotify Premium
          const premium = await spotifyPlayer.checkPremiumStatus(accessToken);
          setIsPremium(premium);

          if (premium) {
            // Initialize player for Premium users
            await spotifyPlayer.initialize(accessToken);
            setPlayerReady(true);
          }
        } catch (error) {
          console.error('Error initializing player:', error);
        }
      }
    };

    initializePlayer();
  }, [isAuthenticated, accessToken]);

  // Load tracks when authenticated or in test mode
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    const allowTestAccess = isDevelopment && localStorage.getItem('latte_test_mode') === 'true';

    if ((isAuthenticated && !authLoading) || allowTestAccess) {
      if (allowTestAccess && !isAuthenticated) {
        // Mock data for test mode with working preview URLs
        setTracks([
          {
            id: 'test1',
            name: 'Bohemian Rhapsody',
            artists: [{ name: 'Queen' }],
            album: {
              name: 'A Night at the Opera',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/8b1b5c6c7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f'
          },
          {
            id: 'test2',
            name: 'Imagine',
            artists: [{ name: 'John Lennon' }],
            album: {
              name: 'Imagine',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e3e3e3e3e3e3e3e3e3e3e3e3' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
          },
          {
            id: 'test3',
            name: 'Hotel California',
            artists: [{ name: 'Eagles' }],
            album: {
              name: 'Hotel California',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f4c4f4c4f4c4f4c4f4c4f4c4' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
          },
          {
            id: 'test4',
            name: 'Stairway to Heaven',
            artists: [{ name: 'Led Zeppelin' }],
            album: {
              name: 'Led Zeppelin IV',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a5a5a5a5a5a5a5a5a5a5a5a5' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
          },
          {
            id: 'test5',
            name: 'Sweet Child O Mine',
            artists: [{ name: 'Guns N Roses' }],
            album: {
              name: 'Appetite for Destruction',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b6b6b6b6b6b6b6b6b6b6b6b6' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
          },
          {
            id: 'test6',
            name: 'Billie Jean',
            artists: [{ name: 'Michael Jackson' }],
            album: {
              name: 'Thriller',
              images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c7c7c7c7c7c7c7c7c7c7c7c7' }]
            },
            preview_url: 'https://p.scdn.co/mp3-preview/5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
          }
        ]);
        setLoading(false);
        setError(null);
      } else {
        fetchQuizTracks();
      }
    }
  }, [isAuthenticated, authLoading]);

  // Show loading spinner during initial auth check
  if (authLoading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <LoadingSpinner 
            size="large" 
            text="Loading..." 
          />
        </MainContent>
      </PageContainer>
    );
  }

  // Show error if not authenticated (unless in test mode)
  const isDevelopment = import.meta.env.DEV;
  const allowTestAccess = isDevelopment && localStorage.getItem('latte_test_mode') === 'true';

  if (!isAuthenticated && !allowTestAccess) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorTitle>Authentication Required</ErrorTitle>
          <ErrorMessage>
            Please log in with your Spotify account to play the music quiz.
          </ErrorMessage>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        {loading ? (
          <LoadingSpinner 
            size="large" 
            text="Preparing your music quiz..." 
          />
        ) : error ? (
          <ErrorContainer>
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        ) : (
          <MusicQuiz
          tracks={tracks}
          spotifyPlayer={spotifyPlayer}
          accessToken={accessToken}
          isPremium={isPremium}
          playerReady={playerReady}
        />
        )}
      </MainContent>
    </PageContainer>
  );
};

export default QuizPage;
