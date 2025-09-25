import React, { useState } from 'react';
import { TextField, Link, Typography, Grid, Paper, Box } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch } from '../util/redux/hooks';
import { login as loginRedux } from '../util/redux/userSlice';
import FormGrid from '../components/form/FormGrid';
import FormCol from '../components/form/FormCol';
import FormRow from '../components/form/FormRow';
import { emailRegex, InputErrorMessage } from '../util/inputvalidation';
import { loginUser } from './api';
import AlertDialog from '../components/AlertDialog';
import VerificationErrorDialog from '../components/VerificationErrorDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import ScreenGrid from '../components/ScreenGrid';
import COLORS from '../assets/colors';

/**
 * A page allowing users to input their email and password to login. The default
 * starting page of the application
 */
function LoginPage() {
  const navigate = useNavigate();

  // Default values for state
  const defaultValues = {
    email: '',
    password: '',
  };
  const defaultShowErrors = {
    email: false,
    password: false,
    alert: false,
  };
  const defaultErrorMessages = {
    email: '',
    password: '',
    alert: '',
  };
  type ValueType = keyof typeof values;

  // State values and hooks
  const [values, setValueState] = useState(defaultValues);
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);
  const [isVerificationError, setIsVerificationError] = useState(false);

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

  const alertTitle = 'Error';
  const handleAlertClose = () => {
    setShowError('alert', false);
    setIsVerificationError(false);
  };

  const dispatch = useAppDispatch();
  function dispatchUser(
    _id: string,
    userEmail: string,
    firstName: string,
    lastName: string,
    admin: boolean,
    role: string,
  ) {
    dispatch(loginRedux({ _id, email: userEmail, firstName, lastName, admin, role }));
  }

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

    if (!values.email.match(emailRegex)) {
      setErrorMessage('email', InputErrorMessage.INVALID_EMAIL);
      setShowError('email', true);
      isValid = false;
    }
    if (!values.password) {
      setErrorMessage('password', InputErrorMessage.MISSING_INPUT);
      setShowError('password', true);
      isValid = false;
    }

    return isValid;
  };

  async function handleSubmit() {
    if (validateInputs()) {
      loginUser(values.email, values.password)
        .then((response) => {
          const user = response.user;
          dispatchUser(
            user._id!,
            user.email!,
            user.firstName!,
            user.lastName!,
            user.admin!,
            user.role!,
          );
          navigate('/home');
        })
        .catch((e) => {
          console.log('failed to login...');
          setShowError('alert', true);
          
          // Check for specific error types and provide better messages
          const errorMessage = e.message.toLowerCase();
          let displayMessage = e.message;
          
          if (errorMessage.includes('already logged in') || errorMessage.includes('already authenticated')) {
            displayMessage = 'You are already logged in. Please refresh the page or try again.';
          } else if (errorMessage.includes('verify') || errorMessage.includes('verification')) {
            setIsVerificationError(true);
          } else if (errorMessage.includes('invalid credentials') || errorMessage.includes('wrong password')) {
            displayMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (errorMessage.includes('user not found')) {
            displayMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
          }
          
          setErrorMessage('alert', displayMessage);
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
                  Welcome to the CELF Green Careers Portal
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray }}
                >
                  Sign in to your account
                </Typography>
              </Grid>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  error={showError.email}
                  helperText={errorMessage.email}
                  type="email"
                  required
                  label="Email"
                  value={values.email}
                  onChange={(e) => setValue('email', e.target.value)}
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
                  error={showError.password}
                  helperText={errorMessage.password}
                  type="password"
                  required
                  label="Password"
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
                  Sign In
                </PrimaryButton>
              </Grid>
              <Grid
                item
                container
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/email-reset"
                    sx={{
                      color: COLORS.primaryBlue,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/login-select"
                    sx={{
                      color: COLORS.primaryBlue,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign up
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      {/* The alert that pops up */}
      <Grid item>
        {isVerificationError ? (
          <VerificationErrorDialog
            showAlert={showError.alert}
            title={alertTitle}
            message={errorMessage.alert}
            userEmail={values.email}
            onClose={handleAlertClose}
          />
        ) : (
          <AlertDialog
            showAlert={showError.alert}
            title={alertTitle}
            message={errorMessage.alert}
            onClose={handleAlertClose}
          />
        )}
      </Grid>
    </ScreenGrid>
  );
}

export default LoginPage;
