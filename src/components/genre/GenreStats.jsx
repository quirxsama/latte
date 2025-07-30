import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../../constants/spotify';
import { getGenreDiversityScore } from '../../utils/genreCategories';

const StatsContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: ${UI_CONFIG.SPACING.XL};
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const StatsHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const StatsTitle = styled.h3`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  font-size: 1.5rem;
`;

const StatsDescription = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${UI_CONFIG.SPACING.LG};
  margin-bottom: ${UI_CONFIG.SPACING.XL};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.MD};
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: ${UI_CONFIG.SPACING.LG};
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  margin-bottom: ${UI_CONFIG.SPACING.SM};
`;

const StatLabel = styled.div`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.9rem;
  font-weight: 500;
`;

const GenreChart = styled.div`
  margin-top: ${UI_CONFIG.SPACING.XL};
`;

const ChartTitle = styled.h4`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  text-align: center;
  font-size: 1.25rem;
`;

const GenreBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  padding: ${UI_CONFIG.SPACING.SM};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }
`;

const GenreInfo = styled.div`
  display: flex;
  align-items: center;
  min-width: 150px;
  margin-right: ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    min-width: 120px;
  }
`;

const GenreIconSmall = styled.span`
  font-size: 1.2rem;
  margin-right: ${UI_CONFIG.SPACING.SM};
`;

const GenreName = styled.span`
  color: ${UI_CONFIG.COLORS.WHITE};
  font-weight: 600;
  font-size: 0.9rem;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-right: ${UI_CONFIG.SPACING.MD};
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}88);
  border-radius: 4px;
  width: ${props => props.percentage}%;
  transition: width 0.8s ease;
`;

const PercentageText = styled.span`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 45px;
  text-align: right;
`;

const DiversityMeter = styled.div`
  margin-top: ${UI_CONFIG.SPACING.XL};
  text-align: center;
`;

const DiversityTitle = styled.h4`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  font-size: 1.25rem;
`;

const DiversityCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 0deg,
    ${UI_CONFIG.COLORS.SPOTIFY_GREEN} ${props => props.score * 3.6}deg,
    rgba(255, 255, 255, 0.1) ${props => props.score * 3.6}deg,
    rgba(255, 255, 255, 0.1) 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${UI_CONFIG.SPACING.MD};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    background: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
    border-radius: 50%;
  }
`;

const DiversityScore = styled.div`
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${UI_CONFIG.COLORS.WHITE};
`;

const DiversityDescription = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.9rem;
  max-width: 300px;
  margin: 0 auto;
`;

const GenreStats = ({ genreStats = [], totalTracks = 0, allGenres = [] }) => {
  const { t } = useTranslation();
  const diversityScore = getGenreDiversityScore(allGenres);
  const topGenres = genreStats.slice(0, 5);
  const totalGenres = genreStats.length;
  const averagePercentage = totalGenres > 0 ?
    Math.round(genreStats.reduce((sum, g) => sum + g.percentage, 0) / totalGenres) : 0;

  const getDiversityLevel = (score) => {
    if (score >= 80) return { level: 'Exceptional', emoji: '🌟' };
    if (score >= 60) return { level: 'High', emoji: '🎯' };
    if (score >= 40) return { level: 'Moderate', emoji: '🎵' };
    if (score >= 20) return { level: 'Low', emoji: '📊' };
    return { level: 'Very Low', emoji: '📈' };
  };

  const diversityLevel = getDiversityLevel(diversityScore);

  if (genreStats.length === 0) {
    return (
      <StatsContainer>
        <StatsHeader>
          <StatsTitle>🎵 {t('genre.stats.title')}</StatsTitle>
          <StatsDescription>
            {t('genre.stats.noGenreData')}
          </StatsDescription>
        </StatsHeader>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle>🎵 {t('genre.yourGenreBreakdown')}</StatsTitle>
        <StatsDescription>
          {t('genre.stats.description')}
        </StatsDescription>
      </StatsHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon>🎶</StatIcon>
          <StatValue>{totalGenres}</StatValue>
          <StatLabel>Different Genres</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>🎵</StatIcon>
          <StatValue>{totalTracks}</StatValue>
          <StatLabel>Total Tracks</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatValue>{averagePercentage}%</StatValue>
          <StatLabel>Average Distribution</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>{diversityLevel.emoji}</StatIcon>
          <StatValue>{diversityScore}</StatValue>
          <StatLabel>Diversity Score</StatLabel>
        </StatCard>
      </StatsGrid>

      {topGenres.length > 0 && (
        <GenreChart>
          <ChartTitle>Top Genres Distribution</ChartTitle>
          {topGenres.map((genre, index) => (
            <GenreBar key={genre.id}>
              <GenreInfo>
                <GenreIconSmall>{genre.icon}</GenreIconSmall>
                <GenreName>{genre.name}</GenreName>
              </GenreInfo>
              <ProgressBarContainer>
                <ProgressBar 
                  percentage={genre.percentage} 
                  color={genre.color}
                />
              </ProgressBarContainer>
              <PercentageText>{genre.percentage}%</PercentageText>
            </GenreBar>
          ))}
        </GenreChart>
      )}

      <DiversityMeter>
        <DiversityTitle>Musical Diversity</DiversityTitle>
        <DiversityCircle score={diversityScore}>
          <DiversityScore>{diversityScore}</DiversityScore>
        </DiversityCircle>
        <DiversityDescription>
          Your musical diversity is <strong>{diversityLevel.level}</strong>. 
          {diversityScore >= 60 ? 
            ' You have a wonderfully varied taste in music!' :
            ' Try exploring new genres to increase your diversity!'
          }
        </DiversityDescription>
      </DiversityMeter>
    </StatsContainer>
  );
};

export default GenreStats;
