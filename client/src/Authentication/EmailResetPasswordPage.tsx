import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Typography, Link, Grid, Paper, Box } from '@mui/material';
import { sendResetPasswordEmail } from './api';
import AlertDialog from '../components/AlertDialog';
import { emailRegex, InputErrorMessage } from '../util/inputvalidation';
import PrimaryButton from '../components/buttons/PrimaryButton';
import ScreenGrid from '../components/ScreenGrid';
import COLORS from '../assets/colors';

/**
 * A page allowing users to input their email so a reset password link can be
 * sent to them
 */
function EmailResetPasswordPage() {
  // Default values for state
  const defaultShowErrors = {
    email: false,
    alert: false,
  };
  const defaultErrorMessages = {
    email: '',
    alert: '',
  };

  // State values and hooks
  const [email, setEmail] = useState('');
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);
  const navigate = useNavigate();

  // Helper functions for changing only one field in a state object
  const setErrorMessage = (field: string, msg: string) => {
    setErrorMessageState((prevState) => ({
      ...prevState,
      ...{ [field]: msg },
    }));
  };
  const setShowError = (field: string, show: boolean) => {
    setShowErrorState((prevState) => ({
      ...prevState,
      ...{ [field]: show },
    }));
  };

  const alertTitle = 'Error';
  const handleAlertClose = () => {
    setShowError('alert', false);
  };

  const validateInputs = () => {
    setShowErrorState(defaultShowErrors);
    setErrorMessageState(defaultErrorMessages);

    if (!email) {
      setErrorMessage('email', InputErrorMessage.MISSING_INPUT);
      setShowError('email', true);
      return false;
    }
    if (!email.match(emailRegex)) {
      setErrorMessage('email', InputErrorMessage.INVALID_EMAIL);
      setShowError('email', true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (validateInputs()) {
      sendResetPasswordEmail(email)
        .then(() => {
          navigate('/');
        })
        .catch((e) => {
          setShowError('alert', true);
          setErrorMessage('alert', e.message);
        });
    }
  };

  return (
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
                  Reset Your Password
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray }}
                >
                  Enter your email to receive a password reset link
                </Typography>
              </Grid>
              <Grid item sx={{ width: '100%', px: 0 }}>
                <TextField
                  fullWidth
                  value={email}
                  error={showError.email}
                  helperText={errorMessage.email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  label="Email"
                  required
                  placeholder="Email Address"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: COLORS.primaryBlue,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item sx={{ width: '100%', px: 0 }}>
                <PrimaryButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  onClick={() => handleSubmit()}
                  sx={{
                    height: 48,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  Send Reset Link
                </PrimaryButton>
              </Grid>
              <Grid item>
                <Link
                  component={RouterLink}
                  to="../"
                  sx={{
                    color: COLORS.primaryBlue,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Back to Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      {/* The alert that pops up */}
      <Grid item>
        <AlertDialog
          showAlert={showError.alert}
          title={alertTitle}
          message={errorMessage.alert}
          onClose={handleAlertClose}
        />
      </Grid>
    </ScreenGrid>
  );
}

export default EmailResetPasswordPage;
