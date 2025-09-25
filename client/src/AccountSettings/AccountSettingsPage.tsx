import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../util/redux/hooks';
import { selectUser, logout as logoutAction } from '../util/redux/userSlice';
import ScreenGrid from '../components/ScreenGrid';
import TopBar from '../components/top_bar/TopBar';
import PrimaryButton from '../components/buttons/PrimaryButton';
import AlertDialog from '../components/AlertDialog';
import COLORS from '../assets/colors';
import { deleteAccount, changePassword } from '../Authentication/api';
import { putData, getData } from '../util/api';
import { login } from '../util/redux/userSlice';

function AccountSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [formState, setFormState] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    }));
  }, [user.firstName, user.lastName, user.email]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = user._id;
      // Handle password change if fields are filled
      if (
        formState.currentPassword ||
        formState.newPassword ||
        formState.confirmPassword
      ) {
        if (!formState.currentPassword || !formState.newPassword || !formState.confirmPassword) {
          setAlertTitle('Error');
          setAlertMessage('Please fill out all password fields.');
          setShowAlert(true);
          return;
        }
        if (formState.newPassword !== formState.confirmPassword) {
          setAlertTitle('Error');
          setAlertMessage('New password and confirmation do not match.');
          setShowAlert(true);
          return;
        }
        try {
          await changePassword(formState.currentPassword, formState.newPassword);
          setAlertTitle('Success');
          setAlertMessage('Your password has been changed successfully!');
          setShowAlert(true);
          setFormState((prev) => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        } catch (err: any) {
          setAlertTitle('Error');
          setAlertMessage(err.message || 'Failed to change password.');
          setShowAlert(true);
          return;
        }
      }
      // Update profile info
      const updateResponse = await putData(`user/${userId}`, {
        firstName: formState.firstName,
        lastName: formState.lastName,
      });
      if (updateResponse.error) {
        setAlertTitle('Error');
        setAlertMessage(updateResponse.error.message || 'Failed to update account settings.');
        setShowAlert(true);
      } else {
        // Fetch latest user info and update Redux
        const userRes = await getData(`user/${userId}`);
        if (userRes && userRes.data) {
          dispatch(
            login({
              _id: userRes.data._id,
              email: userRes.data.email,
              firstName: userRes.data.firstName,
              lastName: userRes.data.lastName,
              admin: userRes.data.admin,
              role: userRes.data.role,
            })
          );
        }
        setAlertTitle('Success');
        setAlertMessage('Your account settings have been updated successfully!');
        setShowAlert(true);
      }
    } catch (err) {
      setAlertTitle('Error');
      setAlertMessage('Failed to update account settings.');
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await deleteAccount();
      setShowDeleteDialog(false);
      setAlertTitle('Success');
      setAlertMessage('Your account has been deleted successfully.');
      setShowAlert(true);
      
      // Logout and redirect to login page
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    } catch (err) {
      setAlertTitle('Error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to delete account');
      setShowAlert(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
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
                      disabled
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        },
                        '& .MuiInputLabel-root.Mui-disabled': {
                          color: 'rgba(0, 0, 0, 0.6)',
                        },
                      }}
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
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Navigate back to appropriate home page based on user type
                      if (user.admin) {
                        navigate('/admin-dashboard');
                      } else if (user.role && user.role.toLowerCase() === 'speaker') {
                        navigate('/speaker-dashboard');
                      } else if (user.role && user.role.toLowerCase() === 'teacher') {
                        navigate('/teacher-search-speaker');
                      } else {
                        navigate('/home');
                      }
                    }}
                    sx={{
                      height: 48,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderColor: COLORS.primaryDark,
                      color: COLORS.primaryDark,
                      '&:hover': {
                        borderColor: COLORS.primaryDark,
                        backgroundColor: COLORS.primaryDark,
                        color: COLORS.white,
                      },
                    }}
                  >
                    Cancel
                  </Button>
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

        {/* Delete Account Section */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: COLORS.white,
            mt: 3,
            border: `2px solid ${COLORS.accentOrange}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: COLORS.accentOrange, mb: 2, fontWeight: 'bold' }}
          >
            Delete Account
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.gray, mb: 2 }}
          >
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowDeleteDialog(true)}
            sx={{
              borderColor: COLORS.accentOrange,
              color: COLORS.accentOrange,
              '&:hover': {
                borderColor: COLORS.accentOrange,
                backgroundColor: COLORS.accentOrange,
                color: COLORS.white,
              },
            }}
          >
            Delete My Account
          </Button>
        </Paper>
      </Box>

      {/* success/error messages */}
      <AlertDialog
        showAlert={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ color: COLORS.accentOrange, fontWeight: 'bold' }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete your account and all associated data.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You will be logged out immediately after account deletion.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: COLORS.accentOrange,
              '&:hover': {
                backgroundColor: COLORS.accentOrange,
                opacity: 0.8,
              },
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AccountSettingsPage;
