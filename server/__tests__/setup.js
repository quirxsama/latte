// Test setup for backend tests
const { beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '3002'; // Different port for tests

// Mock console methods to reduce noise in test output
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

beforeAll(() => {
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 1,
    spotifyId: 'test-spotify-id',
    email: 'test@example.com',
    displayName: 'Test User',
    profileImage: 'https://example.com/image.jpg',
    country: 'TR',
    followers: 100,
    musicStats: {},
    privacy: {
      allowComparison: false,
      showProfile: true,
      showTopTracks: false,
      showTopArtists: false,
      allowFriendRequests: true
    },
    settings: {
      language: 'en',
      theme: 'dark'
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  createMockJWT: (payload = { userId: 1 }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  createAuthHeaders: (token) => ({
    Authorization: `Bearer ${token || global.testUtils.createMockJWT()}`
  }),

  mockDBResponse: (method, returnValue) => {
    const mockDB = require('../config/sqlite');
    mockDB[method].mockReturnValue(returnValue);
  },

  mockDBError: (method, error) => {
    const mockDB = require('../config/sqlite');
    mockDB[method].mockImplementation(() => {
      throw error;
    });
  }
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
