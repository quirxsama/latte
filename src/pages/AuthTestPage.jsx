import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;

  &:hover {
    background: #1ed760;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const UserInfo = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: #e22134;
  background: #ffeaea;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #1db954;
  background: #eafaf1;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const AuthTestPage = () => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    updateProfile 
  } = useAuth();

  const [profileData, setProfileData] = useState({
    displayName: '',
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  const handleProfileUpdate = async () => {
    try {
      setUpdateError('');
      setUpdateMessage('');
      
      await updateProfile(profileData);
      setUpdateMessage('Profile updated successfully!');
      setProfileData({ displayName: '' });
    } catch (error) {
      setUpdateError(error.message);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner text="Loading authentication..." />
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔗 Backend-Frontend Auth Integration Test</Title>
      
      <Section>
        <h3>Authentication Status</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <div>
          <Button onClick={login} disabled={isAuthenticated}>
            Login with Spotify
          </Button>
          <Button onClick={logout} disabled={!isAuthenticated}>
            Logout
          </Button>
        </div>
      </Section>

      {isAuthenticated && user && (
        <Section>
          <h3>User Information</h3>
          <UserInfo>
            <p><strong>ID:</strong> {user.id || 'N/A'}</p>
            <p><strong>Spotify ID:</strong> {user.spotifyId || user.id || 'N/A'}</p>
            <p><strong>Display Name:</strong> {user.displayName || user.display_name || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Country:</strong> {user.country || 'N/A'}</p>
            <p><strong>Followers:</strong> {user.followers || (user.followers?.total) || 0}</p>
            

            
            {user.privacy && (
              <div>
                <h4>Privacy Settings (Backend Data)</h4>
                <p><strong>Allow Comparison:</strong> {user.privacy.allowComparison ? 'Yes' : 'No'}</p>
                <p><strong>Show Profile:</strong> {user.privacy.showProfile ? 'Yes' : 'No'}</p>
              </div>
            )}
            
            {user.settings && (
              <div>
                <h4>User Settings (Backend Data)</h4>
                <p><strong>Language:</strong> {user.settings.language || 'en'}</p>
                <p><strong>Theme:</strong> {user.settings.theme || 'dark'}</p>
              </div>
            )}
          </UserInfo>
        </Section>
      )}

      {isAuthenticated && (
        <Section>
          <h3>Profile Update Test</h3>
          <Input
            type="text"
            placeholder="New display name"
            value={profileData.displayName}
            onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
          />
          <Button 
            onClick={handleProfileUpdate}
            disabled={!profileData.displayName.trim()}
          >
            Update Profile
          </Button>
          
          {updateMessage && <SuccessMessage>{updateMessage}</SuccessMessage>}
          {updateError && <ErrorMessage>{updateError}</ErrorMessage>}
        </Section>
      )}

      <Section>
        <h3>Integration Status</h3>
        <p>
          {isAuthenticated && user?.id ? 
            '✅ Backend integration working - User data from SQLite database' :
            isAuthenticated ? 
              '⚠️ Spotify only - Backend integration failed, using fallback' :
              '❌ Not authenticated'
          }
        </p>
      </Section>
    </Container>
  );
};

export default AuthTestPage;
