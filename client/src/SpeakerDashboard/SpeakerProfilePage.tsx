import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
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
  industry?: string[];
  ageSpecialty?: string;
  bio?: string;
  city?: string;
  state?: string;
  languages?: string[];
  inperson?: boolean;
  virtual?: boolean;
}

interface TeacherProfile {
  school?: string;
  grade?: string;
  subjects?: string[];
  bio?: string;
  city?: string;
  state?: string;
}

function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const isAdmin = user.admin;
  const isSpeaker = window.location.pathname.includes('/speaker');
  const isTeacher = window.location.pathname.includes('/teacher');

  const response = useData(
    `/api/${isSpeaker ? 'speakers' : isTeacher ? 'teachers' : 'admins'}/${
      user.email
    }`,
  );
  const loading = !response;
  const error = response?.error;
  const profile = response?.data;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
            marginTop: '64px',
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
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: COLORS.background,
            marginTop: '64px',
          }}
        >
          <Typography variant="h5" color="error">
            Error loading profile. Please try again later.
          </Typography>
        </Box>
      </div>
    );
  }

  const renderSpeakerProfile = () => (
    <Grid container spacing={3}>
      {/* Profile Picture */}
      <Grid item xs={12} md={4}>
        <Box
          component="img"
          src={(profile as SpeakerProfile)?.picture || '/defaultprofile.jpg'}
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
        <Typography variant="h5" sx={{ color: COLORS.primaryDark, mb: 2 }}>
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
              {(profile as SpeakerProfile)?.industry?.join(', ') ||
                'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Age/Grade Specialty
            </Typography>
            <Typography variant="body1">
              {(profile as SpeakerProfile)?.ageSpecialty || 'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Bio
            </Typography>
            <Typography variant="body1">
              {(profile as SpeakerProfile)?.bio || 'No bio provided'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Location
            </Typography>
            <Typography variant="body1">
              {`${(profile as SpeakerProfile)?.city || ''} ${
                (profile as SpeakerProfile)?.state || ''
              }`}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Languages
            </Typography>
            <Typography variant="body1">
              {(profile as SpeakerProfile)?.languages?.join(', ') ||
                'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Speaking Formats
            </Typography>
            <Typography variant="body1">
              {[
                (profile as SpeakerProfile)?.inperson && 'In-person',
                (profile as SpeakerProfile)?.virtual && 'Virtual',
              ]
                .filter(Boolean)
                .join(', ') || 'Not specified'}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <PrimaryButton
            variant="contained"
            onClick={() => navigate('/profile/edit')}
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
  );

  const renderTeacherProfile = () => (
    <Grid container spacing={3}>
      {/* Profile Information */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ color: COLORS.primaryDark, mb: 2 }}>
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
              School
            </Typography>
            <Typography variant="body1">
              {(profile as TeacherProfile)?.school || 'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Grade
            </Typography>
            <Typography variant="body1">
              {(profile as TeacherProfile)?.grade || 'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Subjects
            </Typography>
            <Typography variant="body1">
              {(profile as TeacherProfile)?.subjects?.join(', ') ||
                'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Bio
            </Typography>
            <Typography variant="body1">
              {(profile as TeacherProfile)?.bio || 'No bio provided'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: COLORS.gray }}>
              Location
            </Typography>
            <Typography variant="body1">
              {`${(profile as TeacherProfile)?.city || ''} ${
                (profile as TeacherProfile)?.state || ''
              }`}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <PrimaryButton
            variant="contained"
            onClick={() => navigate('/profile/edit')}
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
  );

  const renderAdminProfile = () => (
    <Grid container spacing={3}>
      {/* Profile Information */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ color: COLORS.primaryDark, mb: 2 }}>
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
              Role
            </Typography>
            <Typography variant="body1">Administrator</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <PrimaryButton
            variant="contained"
            onClick={() => navigate('/account-settings')}
            sx={{
              height: 48,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            Account Settings
          </PrimaryButton>
        </Box>
      </Grid>
    </Grid>
  );

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
          {isSpeaker && renderSpeakerProfile()}
          {isTeacher && renderTeacherProfile()}
          {isAdmin && renderAdminProfile()}
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

export default ProfilePage;
