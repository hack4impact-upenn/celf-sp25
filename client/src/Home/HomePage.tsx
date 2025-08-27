import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Typography, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks';
import {
  logout as logoutAction,
  selectUser,
} from '../util/redux/userSlice';
import { logout as logoutApi } from './api';
import ScreenGrid from '../components/ScreenGrid';
import PrimaryButton from '../components/buttons/PrimaryButton';

/**
 * The HomePage of the user dashboard. Displays a welcome message and a logout button.
 * This utilizes redux to access the current user's information.
 */
function HomePage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigator = useNavigate();

  useEffect(() => {
    console.log('User state:', user);
    if (user.admin) {
      navigator('/admin-dashboard', { replace: true });
    } else if (user.role && user.role.toLowerCase() === 'speaker') {
      navigator('/speaker-dashboard', { replace: true });
    } else if (user.role && user.role.toLowerCase() === 'teacher') {
      navigator('/teacher-search-speaker', { replace: true });
    }
  }, [user.admin, user.role, navigator]);

  const logoutDispatch = () => dispatch(logoutAction());
  const handleLogout = async () => {
    try {
      const success = await logoutApi();
      if (success) {
        logoutDispatch();
        navigator('/login', { replace: true });
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const message = `Welcome to the CELF Speaker Portal, ${user.firstName} ${user.lastName}!`;
  return (
    <ScreenGrid>
      <Typography variant="h2">{message}</Typography>
      <Grid item container justifyContent="center">
        <PrimaryButton variant="contained" onClick={handleLogout}>
          Logout
        </PrimaryButton>
      </Grid>
    </ScreenGrid>
  );
}

export default HomePage;
