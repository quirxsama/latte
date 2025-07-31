import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Button from '../components/common/Button';
import { SPACING, BREAKPOINTS } from '../constants/themes';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${SPACING.XL};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: ${SPACING.LG};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.XXL};
`;

const Title = styled.h1`
  color: var(--color-text);
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 ${SPACING.MD} 0;
  background: linear-gradient(135deg, var(--color-primary), #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Description = styled.p`
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${SPACING.SM};
  margin-bottom: ${SPACING.XL};
  border-bottom: 1px solid var(--color-border);
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-size: 1rem;
  font-weight: 600;
  padding: ${SPACING.MD} ${SPACING.LG};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: ${SPACING.XL};
`;

const ContentContainer = styled.div`
  background: var(--color-surface);
  border-radius: 16px;
  padding: ${SPACING.XL};
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-medium);
  min-height: 400px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING.XXL};
  color: var(--color-text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${SPACING.LG};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: var(--color-text);
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 ${SPACING.SM} 0;
`;

const EmptyDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
`;

const FriendsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${SPACING.LG};
`;

const FriendCard = styled.div`
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: ${SPACING.LG};
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-large);
  }
`;

const FriendHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.MD};
  margin-bottom: ${SPACING.MD};
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
`;

const FriendInfo = styled.div`
  flex: 1;
`;

const FriendName = styled.h4`
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 ${SPACING.XS} 0;
`;

const FriendCountry = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
`;

const CompatibilitySection = styled.div`
  margin-bottom: ${SPACING.MD};
`;

const CompatibilityScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.SM};
  margin-bottom: ${SPACING.SM};
`;

const ScoreCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #1ed760);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
`;

const ScoreLabel = styled.span`
  color: var(--color-text);
  font-weight: 600;
`;

const SharedItems = styled.div`
  display: flex;
  gap: ${SPACING.MD};
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

const SharedItem = styled.span`
  background: var(--color-surface);
  padding: ${SPACING.XS} ${SPACING.SM};
  border-radius: 6px;
  border: 1px solid var(--color-border);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${SPACING.SM};
`;

const SearchSection = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  padding: ${SPACING.LG};
  margin-bottom: ${SPACING.XL};
  border: 1px solid var(--color-border);
`;

const SearchHeader = styled.div`
  margin-bottom: ${SPACING.LG};
`;

const SearchTitle = styled.h3`
  color: var(--color-text);
  margin: 0 0 ${SPACING.XS} 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const SearchDescription = styled.p`
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.9rem;
`;

const UserIdDisplay = styled.div`
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: ${SPACING.MD};
  margin-bottom: ${SPACING.LG};
  text-align: center;
`;

const UserIdLabel = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-bottom: ${SPACING.XS};
`;

const UserIdValue = styled.div`
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  font-family: monospace;
`;

const SearchInputContainer = styled.div`
  display: flex;
  gap: ${SPACING.MD};
  margin-bottom: ${SPACING.LG};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${SPACING.MD};
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SM};
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING.MD};
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.MD};
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.95rem;
`;

const UserIdSmall = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-family: monospace;
`;

const FriendsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'requests') {
      loadFriendRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await apiService.getFriends();
      setFriends(response.friends || []);
    } catch (error) {
      console.error('Load friends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPendingFriendRequests();
      setFriendRequests(response.requests || []);
    } catch (error) {
      console.error('Load friend requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await apiService.searchUsers(searchQuery);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Search users error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    try {
      const result = await apiService.searchUsers(searchQuery.trim());
      setSearchResults(result.users || []);
    } catch (error) {
      console.error('Search users error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderFriends = () => {
    if (loading) {
      return <LoadingContainer>{t('common.loading')}</LoadingContainer>;
    }

    if (friends.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyTitle>{t('friends.noFriends')}</EmptyTitle>
          <EmptyDescription>
            {t('friends.description')}
          </EmptyDescription>
        </EmptyState>
      );
    }

    return (
      <FriendsGrid>
        {friends.map(friend => (
          <FriendCard key={friend.id}>
            <FriendHeader>
              <Avatar 
                src={friend.profileImage || `https://dummyimage.com/50x50/1DB954/191414.png&text=${friend.displayName?.[0] || 'U'}`}
                alt={friend.displayName}
              />
              <FriendInfo>
                <FriendName>{friend.displayName}</FriendName>
                <FriendCountry>{friend.country}</FriendCountry>
              </FriendInfo>
            </FriendHeader>

            {friend.compatibility && (
              <CompatibilitySection>
                <CompatibilityScore>
                  <ScoreCircle>{friend.compatibility.compatibility}%</ScoreCircle>
                  <ScoreLabel>{t('friends.compatibility')}</ScoreLabel>
                </CompatibilityScore>
                <SharedItems>
                  <SharedItem>{friend.compatibility.details.sharedArtists} {t('friends.sharedArtists')}</SharedItem>
                  <SharedItem>{friend.compatibility.details.sharedTracks} {t('friends.sharedTracks')}</SharedItem>
                  <SharedItem>{friend.compatibility.details.sharedGenres} {t('friends.sharedGenres')}</SharedItem>
                </SharedItems>
              </CompatibilitySection>
            )}

            <ActionButtons>
              <Button variant="outline" size="small">
                {t('friends.viewProfile')}
              </Button>
              <Button variant="danger" size="small">
                {t('friends.remove')}
              </Button>
            </ActionButtons>
          </FriendCard>
        ))}
      </FriendsGrid>
    );
  };

  return (
    <PageContainer>
      <Header>
        <Title>{t('friends.title')}</Title>
        <Description>{t('friends.description')}</Description>
      </Header>



      <TabContainer>
        <Tab
          $active={activeTab === 'friends'}
          onClick={() => setActiveTab('friends')}
        >
          {t('friends.title')}
        </Tab>
        <Tab
          $active={activeTab === 'requests'}
          onClick={() => setActiveTab('requests')}
        >
          {t('friends.friendRequests')}
        </Tab>
        <Tab
          $active={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
        >
          {t('common.search')}
        </Tab>
      </TabContainer>

      {activeTab === 'search' && (
        <SearchContainer>
          {user?.userId && (
            <UserIdDisplay>
              <UserIdLabel>Your User ID</UserIdLabel>
              <UserIdValue>{user.userId}</UserIdValue>
            </UserIdDisplay>
          )}

          <SearchInputContainer>
            <SearchInput
              type="text"
              placeholder="Enter User ID or display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="primary"
              size="small"
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </SearchInputContainer>
        </SearchContainer>
      )}

      <ContentContainer>
        {activeTab === 'friends' && renderFriends()}
        {activeTab === 'requests' && (
          <EmptyState>
            <EmptyIcon>📬</EmptyIcon>
            <EmptyTitle>{t('friends.noRequests')}</EmptyTitle>
          </EmptyState>
        )}
        {activeTab === 'search' && (
          <>
            {searchResults.length > 0 ? (
              <SearchResults>
                {searchResults.map((user) => (
                  <SearchResultItem key={user.id}>
                    <UserInfo>
                      <UserAvatar
                        src={user.profileImage || '/default-avatar.png'}
                        alt={user.displayName}
                      />
                      <UserDetails>
                        <UserName>{user.displayName}</UserName>
                        <UserIdSmall>{user.userId}</UserIdSmall>
                      </UserDetails>
                    </UserInfo>
                    <Button
                      variant={user.relationshipStatus === 'friends' ? 'secondary' : 'primary'}
                      size="small"
                      disabled={user.relationshipStatus !== 'none'}
                    >
                      {user.relationshipStatus === 'friends' ? 'Friends' :
                       user.relationshipStatus === 'pending' ? 'Pending' : 'Add Friend'}
                    </Button>
                  </SearchResultItem>
                ))}
              </SearchResults>
            ) : searchQuery.trim().length >= 2 ? (
              <EmptyState>
                <EmptyIcon>😔</EmptyIcon>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription>
                  Try searching with a different User ID or name
                </EmptyDescription>
              </EmptyState>
            ) : (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>Search for Friends</EmptyTitle>
                <EmptyDescription>
                  Enter a User ID or display name to find friends
                </EmptyDescription>
              </EmptyState>
            )}
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default FriendsPage;
