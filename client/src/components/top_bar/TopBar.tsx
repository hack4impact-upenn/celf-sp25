import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileDropDown from '../ProfileDropDown'; // Adjust the import path as needed
import COLORS from '../../assets/colors'; // Adjust the import path as needed

function TopBar() {
  return (
    <div className="topbar-container">
      <AppBar position="fixed" style={{ backgroundColor: COLORS.white }}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ProfileDropDown sx={{ color: COLORS.primaryDark }} />
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default TopBar;
