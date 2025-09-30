import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, Alert, Snackbar } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import DailyLog from './components/logs/DailyLog';
import Analytics from './components/analytics/Analytics';
import Chat from './components/chat/Chat';
import Profile from './components/profile/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [notification, setNotification] = useState(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navbar />}
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<DailyLog />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Container>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;