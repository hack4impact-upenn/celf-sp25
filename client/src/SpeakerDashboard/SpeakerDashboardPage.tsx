import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import COLORS from '../assets/colors.ts';

function SpeakerDashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const handleNavigateToForm = () => {
    navigate('/speaker-submit-info');
  };

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
              <Typography variant="body1" paragraph>
                Complete your speaker profile to help educators find you and
                request your expertise for their classrooms.
              </Typography>
              <PrimaryButton
                variant="contained"
                onClick={handleNavigateToForm}
                sx={{ mt: 2 }}
              >
                Complete Your Profile
              </PrimaryButton>
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
              <Typography variant="body1" paragraph>
                You currently have no speaking requests. Once you complete your
                profile, educators can request your participation in their
                classrooms.
              </Typography>
              <Button variant="outlined" disabled sx={{ mt: 2 }}>
                View Requests
              </Button>
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
