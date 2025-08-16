import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { UI_CONFIG } from '../constants/spotify';
import { useAuth } from '../contexts/AuthContext';
import spotifyApi from '../services/spotifyApi';
import apiService from '../services/api';
import Header from '../components/common/Header';
import TimeRangeFilter from '../components/common/TimeRangeFilter';
import GenreFilter from '../components/genre/GenreFilter';
import GenreStats from '../components/genre/GenreStats';
import TrackList from '../components/track/TrackList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/common/Footer';
import { categorizeGenres, getGenreStats, getGenreStatsFromTracks, filterTracksByGenre } from '../utils/genreCategories';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: var(--color-gradient-primary);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${UI_CONFIG.SPACING.XL} ${UI_CONFIG.SPACING.LG};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.MD};
  }
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

const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('medium_term');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);

  // Fetch top tracks with time range support
  const fetchTopTracks = async (timeRange = selectedTimeRange, offset = 0, limit = 30) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Handle custom 'all_time' range by using long_term with extended data
      let apiTimeRange = timeRange;
      if (timeRange === 'all_time') {
        apiTimeRange = 'long_term';
      }

      const response = await spotifyApi.getTopTracks(apiTimeRange, limit, offset);

      if (offset === 0) {
        setTracks(response.items);
        // Process genres when getting new tracks
        processGenres(response.items);

        // Save music stats to backend (only on initial load)
        try {
          console.log('🎵 Starting music stats update...');

          // Also get top artists
          const artistsResponse = await spotifyApi.getTopArtists(apiTimeRange, 20);
          console.log('🎵 Got top artists:', artistsResponse.items?.length || 0);

          const musicData = {
            topTracks: response.items,
            topArtists: artistsResponse.items,
            timeRange: apiTimeRange
          };
          console.log('🎵 Sending music data to backend:', musicData);

          await apiService.updateMusicStats(musicData);
          console.log('✅ Music stats updated successfully');
        } catch (error) {
          console.error('❌ Failed to update music stats:', error);
          console.error('❌ Error details:', error.message);
        }
      } else {
        const newTracks = [...tracks, ...response.items];
        setTracks(newTracks);
        // Process genres for all tracks (including new ones)
        processGenres(newTracks);
      }

      // Check if there are more tracks available
      setHasMore(response.total > offset + response.items.length);

    } catch (err) {
      console.error('Error fetching top tracks:', err);
      setError('Failed to load your top tracks. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter tracks by genre
  useEffect(() => {
    if (selectedGenre) {
      const filtered = filterTracksByGenre(tracks, selectedGenre);
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  }, [tracks, selectedGenre]);

  // Load tracks when authenticated or time range changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTopTracks(selectedTimeRange);
    }
  }, [isAuthenticated, authLoading, selectedTimeRange]);



  // Process genres from tracks
  const processGenres = async (trackList) => {
    try {
      // Get detailed artist info for better genre data
      const artistIds = [...new Set(
        trackList.flatMap(track => track.artists.map(artist => artist.id))
      )];

      // Fetch artists in batches of 50 (Spotify API limit)
      const artistDetails = [];
      for (let i = 0; i < artistIds.length; i += 50) {
        const batch = artistIds.slice(i, i + 50);
        const response = await spotifyApi.getArtists(batch);
        artistDetails.push(...response.artists);
      }

      // Create artist lookup map
      const artistMap = {};
      artistDetails.forEach(artist => {
        artistMap[artist.id] = artist;
      });

      // Enrich tracks with artist genre data
      const enrichedTracks = trackList.map(track => ({
        ...track,
        artists: track.artists.map(artist => ({
          ...artist,
          genres: artistMap[artist.id]?.genres || []
        }))
      }));

      // Update tracks with enriched data
      setTracks(enrichedTracks);

      // Extract all genres for reference
      const allTrackGenres = artistDetails.flatMap(artist => artist.genres || []);
      setAllGenres(allTrackGenres);

      // Calculate genre stats from tracks using primary genre system
      const stats = getGenreStatsFromTracks(enrichedTracks);
      console.log('Genre stats calculated:', stats);
      setGenreStats(stats);

    } catch (error) {
      console.error('Error processing genres:', error);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setSelectedGenre(null); // Reset genre filter
  };

  // Handle genre filter change
  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
  };

  // Handle load more tracks
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTopTracks(selectedTimeRange, tracks.length, 20);
    }
  };

  // Get time range display info
  const getTimeRangeTitle = () => {
    const timeRangeMap = {
      'short_term': t('timeRange.lastWeek'),
      'medium_term': t('timeRange.lastMonth'),
      'long_term': t('timeRange.sixMonths'),
      'all_time': t('timeRange.allTime')
    };
    return timeRangeMap[selectedTimeRange] || t('tracks.yourTopTracks');
  };

  const getTimeRangeSubtitle = () => {
    const baseText = user?.display_name ? `, ${user.display_name}` : '';
    const timeRangeMap = {
      'short_term': `${t('timeRange.descriptions.short_term')}${baseText}`,
      'medium_term': `${t('timeRange.descriptions.medium_term')}${baseText}`,
      'long_term': `${t('timeRange.descriptions.long_term')}${baseText}`,
      'all_time': `${t('timeRange.descriptions.all_time')}${baseText}`
    };
    return timeRangeMap[selectedTimeRange] || `${t('tracks.discoverMusic')}${baseText}`;
  };

  // Show loading spinner during initial auth check
  if (authLoading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <LoadingSpinner
            size="large"
            text={t('common.loading')}
          />
        </MainContent>
      </PageContainer>
    );
  }

  // Show error if not authenticated (this shouldn't happen if routing is correct)
  if (!isAuthenticated) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorTitle>Authentication Required</ErrorTitle>
          <ErrorMessage>
            Please log in with your Spotify account to view your top tracks.
          </ErrorMessage>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        {error ? (
          <ErrorContainer>
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        ) : (
          <>
            <TimeRangeFilter
              selectedRange={selectedTimeRange}
              onRangeChange={handleTimeRangeChange}
              showDescription={true}
            />

            {genreStats.length > 0 && (
              <>
                <GenreStats
                  genreStats={genreStats}
                  totalTracks={tracks.length}
                  allGenres={allGenres}
                />
                <GenreFilter
                  selectedGenre={selectedGenre}
                  onGenreChange={handleGenreChange}
                  genreStats={genreStats}
                  totalTracks={tracks.length}
                />
              </>
            )}

            <TrackList
              tracks={filteredTracks}
              loading={loading}
              error={error}
              title={selectedGenre ?
                `${genreStats.find(g => g.id === selectedGenre)?.name || 'Genre'} - ${getTimeRangeTitle()}` :
                getTimeRangeTitle()
              }
              subtitle={selectedGenre ?
                `${filteredTracks.length} tracks in this genre` :
                getTimeRangeSubtitle()
              }
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          </>
        )}
      </MainContent>

      <Footer />
    </PageContainer>
  );
};

export default HomePage;
