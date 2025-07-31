import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import Button from '../common/Button';
import { SPACING } from '../../constants/themes';

const PrivacyContainer = styled.div`
  background: var(--color-surface);
  border-radius: 16px;
  padding: ${SPACING.XL};
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-medium);
`;

const Header = styled.div`
  margin-bottom: ${SPACING.XL};
`;

const Title = styled.h2`
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 ${SPACING.SM} 0;
`;

const Description = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.LG};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${SPACING.LG};
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-hover);
  }
`;

const SettingInfo = styled.div`
  flex: 1;
  margin-right: ${SPACING.LG};
`;

const SettingLabel = styled.h3`
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${SPACING.XS} 0;
`;

const SettingDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

const Toggle = styled.button`
  position: relative;
  width: 50px;
  height: 26px;
  background: ${props => props.$enabled ? 'var(--color-primary)' : 'var(--color-border)'};
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$enabled ? '26px' : '2px'};
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SaveButton = styled(Button)`
  margin-top: ${SPACING.XL};
  align-self: flex-start;
`;

const Message = styled.div`
  padding: ${SPACING.MD};
  border-radius: 8px;
  margin-top: ${SPACING.LG};
  font-size: 0.9rem;
  font-weight: 500;
  
  ${props => props.$type === 'success' && `
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  `}
  
  ${props => props.$type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  `}
`;

const PrivacySettings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    allowComparison: true,
    showProfile: true,
    showTopTracks: true,
    showTopArtists: true,
    allowFriendRequests: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.privacy) {
      setSettings({
        allowComparison: user.privacy.allowComparison ?? true,
        showProfile: user.privacy.showProfile ?? true,
        showTopTracks: user.privacy.showTopTracks ?? true,
        showTopArtists: user.privacy.showTopArtists ?? true,
        allowFriendRequests: user.privacy.allowFriendRequests ?? true
      });
    }
  }, [user]);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const updatedUser = await apiService.updatePrivacySettings(settings);
      updateUser(updatedUser);
      setMessage({ type: 'success', text: t('privacy.saved') });
    } catch (error) {
      console.error('Privacy settings update error:', error);
      setMessage({ type: 'error', text: t('privacy.error') });
    } finally {
      setLoading(false);
    }
  };

  const privacyOptions = [
    {
      key: 'allowComparison',
      label: t('privacy.allowComparison'),
      description: t('privacy.allowComparisonDesc')
    },
    {
      key: 'showProfile',
      label: t('privacy.showProfile'),
      description: t('privacy.showProfileDesc')
    },
    {
      key: 'showTopTracks',
      label: t('privacy.showTopTracks'),
      description: t('privacy.showTopTracksDesc')
    },
    {
      key: 'showTopArtists',
      label: t('privacy.showTopArtists'),
      description: t('privacy.showTopArtistsDesc')
    },
    {
      key: 'allowFriendRequests',
      label: t('privacy.allowFriendRequests'),
      description: t('privacy.allowFriendRequestsDesc')
    }
  ];

  return (
    <PrivacyContainer>
      <Header>
        <Title>{t('privacy.title')}</Title>
        <Description>{t('privacy.description')}</Description>
      </Header>

      <SettingsList>
        {privacyOptions.map(option => (
          <SettingItem key={option.key}>
            <SettingInfo>
              <SettingLabel>{option.label}</SettingLabel>
              <SettingDescription>{option.description}</SettingDescription>
            </SettingInfo>
            <Toggle
              $enabled={settings[option.key]}
              onClick={() => handleToggle(option.key)}
              disabled={loading}
            />
          </SettingItem>
        ))}
      </SettingsList>

      <SaveButton
        onClick={handleSave}
        disabled={loading}
        variant="primary"
      >
        {loading ? t('common.saving') : t('common.save')}
      </SaveButton>

      {message && (
        <Message $type={message.type}>
          {message.text}
        </Message>
      )}
    </PrivacyContainer>
  );
};

export default PrivacySettings;
