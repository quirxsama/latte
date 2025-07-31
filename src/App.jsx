import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalStyles } from './styles/GlobalStyles';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoginPage from './components/common/LoginPage';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import FriendsPage from './pages/FriendsPage';
import CallbackPage from './pages/CallbackPage';
import LandingPage from './pages/LandingPage';
import AuthTestPage from './pages/AuthTestPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import { initSecurity } from './utils/security';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." />;
  }

  // For development/testing: allow access if in development mode
  const isDevelopment = import.meta.env.DEV;
  const allowTestAccess = isDevelopment && localStorage.getItem('latte_test_mode') === 'true';

  return (isAuthenticated || allowTestAccess) ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." />;
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  useEffect(() => {
    // Initialize security on app start
    const securityInitialized = initSecurity();
    if (!securityInitialized) {
      console.error('🚨 Security initialization failed');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GlobalStyles />
          <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/callback"
              element={<CallbackPage />}
            />
            <Route
              path="/"
              element={<LandingPage />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth-test"
              element={<AuthTestPage />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
