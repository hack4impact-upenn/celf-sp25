import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import AlertDialog from '../components/AlertDialog.tsx';
import COLORS from '../assets/colors.ts';

function AccountSettingsPage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [formState, setFormState] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account settings update logic
    setAlertTitle('Success');
    setAlertMessage('Your account settings have been updated successfully!');
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
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
          mt: 8,
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
          Account Settings
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: COLORS.white,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ color: COLORS.primaryDark, mb: 2 }}
                >
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Change Password Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ color: COLORS.primaryDark, mb: 2 }}
                >
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formState.currentPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formState.newPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formState.confirmPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
                >
                  <PrimaryButton
                    type="submit"
                    variant="contained"
                    sx={{
                      height: 48,
                      fontSize: '1rem',
                      textTransform: 'none',
                    }}
                  >
                    Save Changes
                  </PrimaryButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* success/error messages */}
      <AlertDialog
        showAlert={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </div>
  );
}

export default AccountSettingsPage;
