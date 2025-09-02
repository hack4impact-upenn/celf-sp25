import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Typography, Grid, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks';
import {
  logout as logoutAction,
  selectUser,
} from '../util/redux/userSlice';
import { logout as logoutApi } from './api';
import ScreenGrid from '../components/ScreenGrid';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { useData } from '../util/api';

/**
 * The HomePage of the user dashboard. Displays a welcome message and a logout button.
 * This utilizes redux to access the current user's information.
 */
function HomePage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigator = useNavigate();
  const authStatus = useData('auth/authstatus');

  useEffect(() => {
    console.log('User state:', user);
    console.log('User admin:', user.admin);
    console.log('User role:', user.role);
    console.log('Auth status:', authStatus);
    
    // Wait for auth status to be loaded
    if (authStatus === null) {
      console.log('Auth status not loaded yet, waiting...');
      return;
    }
    
    // If not authenticated, redirect to login
    if (authStatus.error) {
      console.log('User not authenticated, redirecting to login');
      navigator('/login', { replace: true });
      return;
    }
    
    // Check if user data is loaded (not just the initial state)
    console.log('User ID:', user._id);
    console.log('User email:', user.email);
    console.log('User admin:', user.admin);
    console.log('User role:', user.role);
    console.log('Auth status:', authStatus);
    console.log('Auth status error:', authStatus.error);
    console.log('Auth status data:', authStatus.data);
    if (user._id && user.email) {
      if (user.admin) {
        console.log('Redirecting to admin dashboard');
        navigator('/admin-dashboard', { replace: true });
      } else if (user.role && user.role.toLowerCase() === 'speaker') {
        console.log('Redirecting to speaker dashboard');
        navigator('/speaker-dashboard', { replace: true });
      } else if (user.role && user.role.toLowerCase() === 'teacher') {
        console.log('Redirecting to teacher search');
        navigator('/teacher-search-speaker', { replace: true });
      } else {
        console.log('No valid role found, user:', user);
        // If user is authenticated but has no role, redirect to login
        navigator('/login', { replace: true });
      }
    } else {
      console.log('User data not loaded yet, waiting...');
    }
  }, [user, authStatus, navigator]); 

  const logoutDispatch = () => dispatch(logoutAction());

  // Show loading screen while redirecting
  return (
    <ScreenGrid>
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item>
          <CircularProgress size={60} />
        </Grid>
        <Grid item>
          <Typography variant="h4" align="center" gutterBottom>
            Loading your dashboard...
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" align="center" color="textSecondary">
            Please wait while we verify your authentication and redirect you.
          </Typography>
        </Grid>
      </Grid>
    </ScreenGrid>
  );
}

export default HomePage;
