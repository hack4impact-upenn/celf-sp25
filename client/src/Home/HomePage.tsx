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
    console.log('User admin:', user.admin);
    console.log('User role:', user.role);
    
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
    }
  }, [user.admin, user.role]); // Remove navigator from dependencies

  const logoutDispatch = () => dispatch(logoutAction());

  // Show loading screen while redirecting
  return (
    <ScreenGrid>
      <Typography variant="h4" align="center" gutterBottom>
        Redirecting to your dashboard...
      </Typography>
      <Typography variant="body1" align="center" color="textSecondary">
        Please wait while we take you to the right place.
      </Typography>
    </ScreenGrid>
  );
}

export default HomePage;
