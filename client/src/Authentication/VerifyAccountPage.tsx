import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Grid,
  Typography,
  Button,
  Paper,
  Box,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { verifyAccount } from './api.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import COLORS from '../assets/colors.ts';

/**
 * A page users visit to verify their account. Page should be accessed via
 * a link sent to their email and the path should contain a token as a query
 * param for this page to use to make the correct server request.
 */
function VerifyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    verifyAccount(token || 'missing token')
      .then(() => {
        setMessage('Account successfully verified!');
        setLoading(false);
      })
      .catch(() => {
        // Don't want to display server error message to the user
        setMessage('Unable to verify account');
        setLoading(false);
      });
  }, [token]); // Only runs when there is a change in token

  return loading ? (
    <ScreenGrid>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <CircularProgress sx={{ color: COLORS.primaryBlue }} />
      </Box>
    </ScreenGrid>
  ) : (
    <ScreenGrid>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: 450,
            background: COLORS.white,
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Grid container direction="column" alignItems="center" spacing={3}>
              <Grid item sx={{ mb: 3 }}>
                <Box
                  component="img"
                  src="/images/celf-logo.png"
                  alt="CELF Logo"
                  sx={{
                    height: 80,
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Grid>
              <Grid item>
                <Typography
                  variant="h4"
                  textAlign="center"
                  sx={{
                    color: COLORS.primaryDark,
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  href="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: COLORS.primaryBlue,
                    color: COLORS.white,
                    '&:hover': {
                      backgroundColor: COLORS.primaryDark,
                    },
                    height: 48,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  Back to Login
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </ScreenGrid>
  );
}

export default VerifyAccountPage;
