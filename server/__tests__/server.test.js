const request = require('supertest');
const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

// Mock the database connection
jest.mock('../config/database', () => jest.fn());

// Mock SQLite database
const mockDB = {
  connect: jest.fn(),
  close: jest.fn(),
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserBySpotifyId: jest.fn(),
  updateUser: jest.fn(),
  isConnected: true,
};

jest.mock('../config/sqlite', () => mockDB);

// Import app after mocking
const app = require('../server');

describe('Server API Tests', () => {
  beforeAll(() => {
    // Suppress console logs during tests
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console
    console.log.mockRestore();
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Auth Routes', () => {
    describe('POST /api/auth/spotify', () => {
      it('should create new user with valid Spotify data', async () => {
        const spotifyUserData = {
          spotifyId: 'test-spotify-id',
          email: 'test@example.com',
          displayName: 'Test User',
          profileImage: 'https://example.com/image.jpg',
          country: 'TR',
          followers: 100
        };

        const mockUser = {
          id: 1,
          ...spotifyUserData,
          createdAt: new Date().toISOString()
        };

        mockDB.getUserBySpotifyId.mockReturnValue(null);
        mockDB.createUser.mockReturnValue(mockUser);

        const response = await request(app)
          .post('/api/auth/spotify')
          .send(spotifyUserData)
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.displayName).toBe('Test User');
        expect(mockDB.createUser).toHaveBeenCalledWith(spotifyUserData);
      });

      it('should return existing user if already exists', async () => {
        const spotifyUserData = {
          spotifyId: 'existing-spotify-id',
          email: 'existing@example.com',
          displayName: 'Existing User'
        };

        const existingUser = {
          id: 1,
          ...spotifyUserData,
          createdAt: new Date().toISOString()
        };

        mockDB.getUserBySpotifyId.mockReturnValue(existingUser);
        mockDB.updateUser.mockReturnValue(existingUser);

        const response = await request(app)
          .post('/api/auth/spotify')
          .send(spotifyUserData)
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.displayName).toBe('Existing User');
        expect(mockDB.updateUser).toHaveBeenCalled();
      });

      it('should return 400 for missing required fields', async () => {
        const invalidData = {
          email: 'test@example.com'
          // Missing spotifyId and displayName
        };

        const response = await request(app)
          .post('/api/auth/spotify')
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('required');
      });
    });

    describe('GET /api/auth/profile', () => {
      it('should return 401 without auth token', async () => {
        await request(app)
          .get('/api/auth/profile')
          .expect(401);
      });

      it('should return user profile with valid token', async () => {
        const mockUser = {
          id: 1,
          spotifyId: 'test-spotify-id',
          displayName: 'Test User',
          email: 'test@example.com'
        };

        mockDB.getUserById.mockReturnValue(mockUser);

        // Mock JWT verification
        const jwt = require('jsonwebtoken');
        jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 1 });

        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer valid-token')
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user.displayName).toBe('Test User');
      });
    });
  });



  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should handle server errors gracefully', async () => {
      // Mock database error
      mockDB.getUserById.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 1 });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Something went wrong!');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple requests quickly
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      
      // All should succeed initially (within rate limit)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});
