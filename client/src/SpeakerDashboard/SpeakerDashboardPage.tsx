import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import COLORS from '../assets/colors.ts';
import { getData } from '../util/api.tsx';

function SpeakerDashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        setLoading(true);
        const response = await getData('speaker/profile');
        if (response.error) {
          // If speaker not found, they don't have a profile
          setHasProfile(false);
        } else {
          setHasProfile(true);
        }
      } catch (err) {
        setError('Failed to check profile status');
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user.email]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            marginTop: '64px',
          }}
        >
          <CircularProgress sx={{ color: COLORS.primaryBlue }} />
        </Box>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <TopBar />
      <Box
        sx={{
          padding: 4,
          flexGrow: 1,
          backgroundColor: COLORS.background,
          marginTop: '64px',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: COLORS.primaryDark,
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          Welcome, {user.firstName}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: COLORS.white,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: COLORS.primaryDark, fontWeight: 600 }}
              >
                Your Profile
              </Typography>
              {hasProfile ? (
                <>
                  <Typography variant="body1" paragraph>
                    Manage your speaker profile and help educators find you for their classrooms.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <PrimaryButton
                      variant="contained"
                      onClick={() => navigate('/profile/edit')}
                    >
                      Edit Profile
                    </PrimaryButton>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" paragraph sx={{ color: 'warning.main' }}>
                    Complete your speaker profile to start appearing in teacher search results and receive speaking requests.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <PrimaryButton
                      variant="contained"
                      onClick={() => navigate('/speaker-submit-info')}
                      sx={{ backgroundColor: COLORS.primaryBlue }}
                    >
                      Complete Profile
                    </PrimaryButton>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Upcoming Requests Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: COLORS.white,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: COLORS.primaryDark, fontWeight: 600 }}
              >
                Speaking Requests
              </Typography>
              {hasProfile ? (
                <>
                  <Typography variant="body1" paragraph>
                    Educators can request your participation in their classrooms.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/speaker-requests')}
                    sx={{ 
                      height: 48,
                      fontSize: '1rem',
                      textTransform: 'none',
                    }}
                  >
                    View Requests
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
                    Complete your profile first to start receiving speaking requests from educators.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    sx={{ mt: 2 }}
                  >
                    View Requests
                  </Button>
                </>
              )}
            </Paper>
          </Grid>

          {/* Tips Card */}
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: COLORS.white,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: COLORS.primaryDark, fontWeight: 600 }}
              >
                Tips for a Great Profile
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{ backgroundColor: COLORS.lightBlue, height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Be Specific
                      </Typography>
                      <Typography variant="body2">
                        Detail your areas of expertise and the specific
                        environmental topics you're passionate about.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{ backgroundColor: COLORS.lightBlue, height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Add a Photo
                      </Typography>
                      <Typography variant="body2">
                        A professional photo helps educators connect with you
                        and builds trust.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{ backgroundColor: COLORS.lightBlue, height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Share Your Experience
                      </Typography>
                      <Typography variant="body2">
                        Mention previous speaking engagements or work with
                        students in your bio.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default SpeakerDashboardPage;
