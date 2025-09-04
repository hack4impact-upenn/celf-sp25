import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Grid,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ScreenGrid from '../components/ScreenGrid';
import COLORS from '../assets/colors';

interface InviteData {
  email: string;
  role: 'teacher' | 'admin' | 'speaker';
  verificationToken: string;
  firstName?: string;
  lastName?: string;
}

/**
 * A page users visit when they click an invite link from their email.
 * This page verifies the invite token and redirects to the appropriate registration page.
 */
function InvitePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }

    // Call the backend to verify the invite token
    console.log('Verifying invite token:', token);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backendUrl}/api/admin/invite/${token}`, {
      credentials: 'include',
    })
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Invalid or expired invite');
        }
        return response.json();
      })
      .then((data: InviteData) => {
        console.log('Invite data received:', data);
        // Redirect to the appropriate registration page based on role
        switch (data.role) {
          case 'admin':
            navigate('/admin-register', { 
              state: { 
                email: data.email, 
                token: data.verificationToken,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName
              } 
            });
            break;
          case 'teacher':
            navigate('/teacher-register', { 
              state: { 
                email: data.email, 
                token: data.verificationToken,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName
              } 
            });
            break;
          case 'speaker':
            navigate('/speaker-register', { 
              state: { 
                email: data.email, 
                token: data.verificationToken,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName
              } 
            });
            break;
          default:
            setError('Invalid role in invite');
            setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error verifying invite:', err);
        setError(`Invalid or expired invite link: ${err.message}`);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) {
    return (
      <ScreenGrid>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress size={60} sx={{ color: COLORS.primaryBlue }} />
          <Typography
            variant="h6"
            sx={{ marginTop: 2, color: COLORS.primaryBlue }}
          >
            Verifying invite...
          </Typography>
        </Box>
      </ScreenGrid>
    );
  }

  return (
    <ScreenGrid>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '60vh' }}
      >
        <Grid item>
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 400,
            }}
          >
            <Typography
              variant="h5"
              sx={{ marginBottom: 2, color: COLORS.primaryBlue }}
            >
              Invalid Invite
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', color: COLORS.gray }}
            >
              {error}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </ScreenGrid>
  );
}

export default InvitePage; 