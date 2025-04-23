import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import AlertDialog from '../components/AlertDialog.tsx';
import COLORS from '../assets/colors.ts';
import { useData } from '../util/api.tsx';

interface SpeakerProfile {
  picture?: string;
  industry?: string;
  ageSpecialty?: string;
  bio?: string;
}

function SpeakerProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const response = useData(`/api/speakers/${user.email}`);
  const loading = !response;
  const error = response?.error;
  const speakerProfile = (response?.data as SpeakerProfile) || {};

  const handleEditProfile = () => {
    navigate('/speaker-submit-info');
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <TopBar />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <CircularProgress sx={{ color: COLORS.primaryBlue }} />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <TopBar />
        <Box
          sx={{ padding: 4, flexGrow: 1, backgroundColor: COLORS.background }}
        >
          <Typography variant="h5" color="error">
            Error loading profile. Please try again later.
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <TopBar />
      <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: COLORS.background }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: COLORS.primaryDark,
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          Your Profile
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: COLORS.white,
          }}
        >
          <Grid container spacing={3}>
            {/* Profile Picture */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={speakerProfile.picture || '/defaultprofile.jpg'}
                alt="Profile"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  objectFit: 'cover',
                }}
              />
            </Grid>

            {/* Profile Information */}
            <Grid item xs={12} md={8}>
              <Typography
                variant="h5"
                sx={{ color: COLORS.primaryDark, mb: 2 }}
              >
                {`${user.firstName} ${user.lastName}`}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
                    Industry
                  </Typography>
                  <Typography variant="body1">
                    {speakerProfile.industry || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
                    Age/Grade Specialty
                  </Typography>
                  <Typography variant="body1">
                    {speakerProfile.ageSpecialty || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
                    Bio
                  </Typography>
                  <Typography variant="body1">
                    {speakerProfile.bio || 'No bio provided'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <PrimaryButton
                  variant="contained"
                  onClick={handleEditProfile}
                  sx={{
                    height: 48,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  Edit Profile
                </PrimaryButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <AlertDialog
        showAlert={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </div>
  );
}

export default SpeakerProfilePage;
