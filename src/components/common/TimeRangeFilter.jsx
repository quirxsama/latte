import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../../constants/spotify';

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  padding: 0 16px;
`;

const FilterTabs = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  padding: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow-x: auto;
  
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const FilterTab = styled.button`
  background: ${props => props.$active ?
    'var(--color-gradient-accent)' :
    'transparent'
  };
  color: ${props => props.$active ?
    'var(--color-background)' :
    'var(--color-text-secondary)'
  };
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &:hover {
    color: ${props => props.$active ?
      'var(--color-background)' :
      'var(--color-text)'
    };
    background: ${props => props.$active ?
      'var(--color-gradient-accent)' :
      'var(--color-surface-hover)'
    };
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:active::after {
    width: 100px;
    height: 100px;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
    font-size: 0.85rem;
  }
`;

const FilterInfo = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.9rem;
  
  .highlight {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    font-weight: 600;
  }
`;



const TimeRangeFilter = ({
  selectedRange = 'medium_term',
  onRangeChange,
  showDescription = true
}) => {
  const [activeRange, setActiveRange] = useState(selectedRange);
  const { t } = useTranslation();

  const handleRangeChange = (range) => {
    setActiveRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  const getTimeRanges = () => [
    {
      key: 'short_term',
      label: t('timeRange.short_term'),
      description: t('timeRange.descriptions.short_term'),
      icon: '📅'
    },
    {
      key: 'medium_term',
      label: t('timeRange.medium_term'),
      description: t('timeRange.descriptions.medium_term'),
      icon: '📊'
    },
    {
      key: 'long_term',
      label: t('timeRange.long_term'),
      description: t('timeRange.descriptions.long_term'),
      icon: '📈'
    },
    {
      key: 'all_time',
      label: t('timeRange.allTime'),
      description: t('timeRange.descriptions.all_time'),
      icon: '🏆'
    }
  ];

  const getSelectedRangeInfo = () => {
    return getTimeRanges().find(range => range.key === activeRange);
  };

  return (
    <>
      <FilterContainer>
        <FilterTabs>
          {getTimeRanges().map((range) => (
            <FilterTab
              key={range.key}
              $active={activeRange === range.key}
              onClick={() => handleRangeChange(range.key)}
              title={range.description}
            >
              <span style={{ marginRight: '6px' }}>{range.icon}</span>
              {range.label}
            </FilterTab>
          ))}
        </FilterTabs>
      </FilterContainer>

      {showDescription && (
        <FilterInfo>
          <span className="highlight">{getSelectedRangeInfo()?.icon}</span>
          {' '}
          {getSelectedRangeInfo()?.description}
        </FilterInfo>
      )}
    </>
  );
};

export default TimeRangeFilter;
