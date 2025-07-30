import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../../constants/spotify';
import { MAIN_GENRES } from '../../utils/genreCategories';

const FilterContainer = styled.div`
  margin-bottom: ${UI_CONFIG.SPACING.XL};
  padding: 0 ${UI_CONFIG.SPACING.MD};
`;

const FilterHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
`;

const FilterTitle = styled.h3`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  font-size: 1.25rem;
`;

const FilterDescription = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.9rem;
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${UI_CONFIG.SPACING.MD};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: ${UI_CONFIG.SPACING.SM};
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
`;

const GenreCard = styled.button`
  background: ${props => props.$active ?
    `linear-gradient(135deg, ${props.$color}22, ${props.$color}11)` :
    'rgba(255, 255, 255, 0.05)'
  };
  border: 2px solid ${props => props.$active ? props.$color : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: ${UI_CONFIG.SPACING.LG};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => `linear-gradient(135deg, ${props.$color}33, ${props.$color}11)`};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => `${props.$color}22`};
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const GenreIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  filter: ${props => props.$active ? 'none' : 'grayscale(50%)'};
  transition: filter 0.3s ease;
`;

const GenreName = styled.div`
  color: ${props => props.$active ? UI_CONFIG.COLORS.WHITE : UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: ${UI_CONFIG.SPACING.XS};
  transition: color 0.3s ease;
`;

const GenreCount = styled.div`
  color: ${props => props.$active ? props.$color : UI_CONFIG.COLORS.SPOTIFY_GRAY};
  font-size: 0.8rem;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const AllGenresCard = styled(GenreCard)`
  background: ${props => props.$active ?
    'var(--color-surface-active)' :
    'var(--color-surface)'
  };
  border-color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-border)'};

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-hover);
    box-shadow: var(--shadow-glow);
  }
`;

const GenreFilter = ({
  selectedGenre = null,
  onGenreChange,
  genreStats = [],
  totalTracks = 0
}) => {
  const [hoveredGenre, setHoveredGenre] = useState(null);
  const { t } = useTranslation();

  const handleGenreSelect = (genreId) => {
    const newGenre = genreId === selectedGenre ? null : genreId;
    if (onGenreChange) {
      onGenreChange(newGenre);
    }
  };

  const getGenreCount = (genreId) => {
    const stat = genreStats.find(s => s.id === genreId);
    return stat ? stat.count : 0;
  };

  const getGenrePercentage = (genreId) => {
    const stat = genreStats.find(s => s.id === genreId);
    return stat ? stat.percentage : 0;
  };

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>🎵 {t('genre.filterByGenre')}</FilterTitle>
        <FilterDescription>
          {t('genre.description')}
        </FilterDescription>
      </FilterHeader>

      <GenreGrid>
        {/* All Genres Option */}
        <AllGenresCard
          $active={selectedGenre === null}
          onClick={() => handleGenreSelect(null)}
          onMouseEnter={() => setHoveredGenre('all')}
          onMouseLeave={() => setHoveredGenre(null)}
        >
          <GenreIcon $active={selectedGenre === null}>🎶</GenreIcon>
          <GenreName
            $active={selectedGenre === null}
            $color={UI_CONFIG.COLORS.SPOTIFY_GREEN}
          >
            {t('genre.allGenres')}
          </GenreName>
          <GenreCount
            $active={selectedGenre === null}
            $color={UI_CONFIG.COLORS.SPOTIFY_GREEN}
          >
            {totalTracks} tracks
          </GenreCount>
        </AllGenresCard>

        {/* Individual Genre Cards */}
        {Object.values(MAIN_GENRES).map((genre) => {
          const count = getGenreCount(genre.id);
          const percentage = getGenrePercentage(genre.id);
          const isActive = selectedGenre === genre.id;
          const isHovered = hoveredGenre === genre.id;

          // Only show genres that have tracks
          if (count === 0) return null;

          return (
            <GenreCard
              key={genre.id}
              $active={isActive}
              $color={genre.color}
              onClick={() => handleGenreSelect(genre.id)}
              onMouseEnter={() => setHoveredGenre(genre.id)}
              onMouseLeave={() => setHoveredGenre(null)}
              title={`${genre.name} - ${count} tracks (${percentage}%)`}
            >
              <GenreIcon $active={isActive || isHovered}>
                {genre.icon}
              </GenreIcon>
              <GenreName
                $active={isActive || isHovered}
                $color={genre.color}
              >
                {genre.name}
              </GenreName>
              <GenreCount
                $active={isActive || isHovered}
                $color={genre.color}
              >
                {count} tracks ({percentage}%)
              </GenreCount>
            </GenreCard>
          );
        })}
      </GenreGrid>
    </FilterContainer>
  );
};

export default GenreFilter;
