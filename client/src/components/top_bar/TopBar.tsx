import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ProfileDropDown from '../ProfileDropDown'; // Adjust the import path as needed
import COLORS from '../../assets/colors'; // Adjust the import path as needed

function TopBar() {
  const location = useLocation();
  const showLogo = location.pathname === '/speaker-dashboard';

  return (
    <div className="topbar-container">
      <AppBar position="fixed" style={{ backgroundColor: COLORS.white }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showLogo && (
              <img
                src="/images/celf-logo.png"
                alt="CELF Logo"
                style={{ height: 48, width: 'auto', marginRight: 16 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ProfileDropDown sx={{ color: COLORS.primaryDark }} />
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default TopBar;
