import React, { useState } from 'react';
import { TextField, Link, Typography, Grid, Paper, Box } from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { resetPassword } from './api.ts';
import { InputErrorMessage, passwordRegex } from '../util/inputvalidation.ts';
import AlertDialog from '../components/AlertDialog.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import COLORS from '../assets/colors.ts';

/**
 * A page that allows users to reset their password by inputting a new password
 * into a form.
 */
function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Default values for state
  const defaultValues = {
    password: '',
    confirmPassword: '',
  };
  const defaultShowErrors = {
    password: false,
    confirmPassword: false,
    alert: false,
  };
  const defaultErrorMessages = {
    password: '',
    confirmPassword: '',
    alert: '',
  };
  type ValueType = keyof typeof values;

  // State values and hooks
  const [values, setValueState] = useState(defaultValues);
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);

  // Helper functions for changing only one field in a state object
  const setValue = (field: string, value: string) => {
    setValueState((prevState) => ({
      ...prevState,
      ...{ [field]: value },
    }));
  };
  const setShowError = (field: string, show: boolean) => {
    setShowErrorState((prevState) => ({
      ...prevState,
      ...{ [field]: show },
    }));
  };
  const setErrorMessage = (field: string, msg: string) => {
    setErrorMessageState((prevState) => ({
      ...prevState,
      ...{ [field]: msg },
    }));
  };

  const clearErrorMessages = () => {
    setShowErrorState(defaultShowErrors);
    setErrorMessageState(defaultErrorMessages);
  };

  const validateInputs = () => {
    clearErrorMessages();
    let isValid = true;

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const valueTypeString in values) {
      const valueType = valueTypeString as ValueType;
      if (!values[valueType]) {
        setErrorMessage(valueTypeString, InputErrorMessage.MISSING_INPUT);
        setShowError(valueTypeString, true);
        isValid = false;
      }
    }

    if (!values.password.match(passwordRegex)) {
      setErrorMessage('password', InputErrorMessage.INVALID_PASSWORD);
      setShowError('password', true);
      isValid = false;
    }
    if (!(values.password === values.confirmPassword)) {
      setErrorMessage('confirmPassword', InputErrorMessage.PASSWORD_MISMATCH);
      setShowError('confirmPassword', true);
      isValid = false;
    }
    return isValid;
  };

  const alertTitle = 'Error';
  const handleAlertClose = () => {
    setShowError('alert', false);
  };

  async function handleSubmit() {
    if (validateInputs()) {
      resetPassword(values.password, token || 'missing token')
        .then(() => {
          navigate('/');
        })
        .catch((e) => {
          setErrorMessage('alert', e.message);
          setShowError('alert', true);
        });
    }
  }

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
                  Enter your new password below
                </Typography>
              </Grid>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  error={showError.password}
                  helperText={errorMessage.password}
                  type="password"
                  required
                  label="New Password"
                  value={values.password}
                  onChange={(e) => setValue('password', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: COLORS.primaryBlue,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  error={showError.confirmPassword}
                  helperText={errorMessage.confirmPassword}
                  type="password"
                  required
                  label="Confirm Password"
                  value={values.confirmPassword}
                  onChange={(e) => setValue('confirmPassword', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: COLORS.primaryBlue,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item sx={{ width: '100%' }}>
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
                  Reset Password
                </PrimaryButton>
              </Grid>
              <Grid item>
                <Link
                  component={RouterLink}
                  to="/login"
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
      <AlertDialog
        showAlert={showError.alert}
        title={alertTitle}
        message={errorMessage.alert}
        onClose={handleAlertClose}
      />
    </ScreenGrid>
  );
}

export default ResetPasswordPage;
