import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import {
  Dashboard,
  Assessment,
  Chat,
  Person,
  AddCircle,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Dashboard /> },
    { label: 'Log Mood', path: '/log', icon: <AddCircle /> },
    { label: 'Analytics', path: '/analytics', icon: <Assessment /> },
    { label: 'Chat', path: '/chat', icon: <Chat /> },
    { label: 'Profile', path: '/profile', icon: <Person /> }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🧠 Mood AI
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {item.label}
            </Button>
          ))}
          
          <Typography variant="body2" sx={{ mx: 2 }}>
            Welcome, {user?.username}!
          </Typography>
          
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;