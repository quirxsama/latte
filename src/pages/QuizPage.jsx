import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { UI_CONFIG } from '../constants/spotify';
import { useAuth } from '../contexts/AuthContext';
import spotifyApi from '../services/spotifyApi';
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
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tracks for quiz (mix of different time ranges for variety)
  const fetchQuizTracks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tracks from different time periods for variety
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        spotifyApi.getTopTracks('short_term', 20, 0).catch(() => ({ items: [] })),
        spotifyApi.getTopTracks('medium_term', 20, 0).catch(() => ({ items: [] })),
        spotifyApi.getTopTracks('long_term', 20, 0).catch(() => ({ items: [] }))
      ]);

      // Combine and deduplicate tracks
      const allTracks = [
        ...shortTerm.items,
        ...mediumTerm.items,
        ...longTerm.items
      ];

      // Remove duplicates and filter tracks with preview URLs
      const uniqueTracks = allTracks.reduce((acc, track) => {
        if (!acc.find(t => t.id === track.id) && track.preview_url) {
          acc.push(track);
        }
        return acc;
      }, []);

      if (uniqueTracks.length < 4) {
        setError('Not enough tracks with preview available for the quiz. You need at least 4 tracks with audio previews.');
        return;
      }

      setTracks(uniqueTracks);

    } catch (err) {
      console.error('Error fetching quiz tracks:', err);
      setError('Failed to load tracks for the quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load tracks when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchQuizTracks();
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

  // Show error if not authenticated
  if (!isAuthenticated) {
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
          <MusicQuiz tracks={tracks} />
        )}
      </MainContent>
    </PageContainer>
  );
};

export default QuizPage;
