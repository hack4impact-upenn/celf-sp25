import React, { useState, useEffect } from 'react';
import { Link, TextField, Grid, Typography, Paper, Box } from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import FormCol from '../components/form/FormCol.tsx';
import {
  emailRegex,
  InputErrorMessage,
  nameRegex,
  passwordRegex,
} from '../util/inputvalidation.ts';
import { register, registerInvite } from './api.ts';
import AlertDialog from '../components/AlertDialog.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import FormRow from '../components/form/FormRow.tsx';
import FormGrid from '../components/form/FormGrid.tsx';
import COLORS from '../assets/colors.ts';

/**
 * A page users visit to be able to register for a new account by inputting
 * fields such as their name, email, and password.
 */
function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Default values for state
  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  const defaultShowErrors = {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    alert: false,
  };
  const defaultErrorMessages = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    alert: '',
  };
  type ValueType = keyof typeof values;

  // State values and hooks
  const [values, setValueState] = useState(defaultValues);
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);
  const [alertTitle, setAlertTitle] = useState('Error');
  const [isRegistered, setRegistered] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Handle invite data from navigation state or URL params
  useEffect(() => {
    // Check for invite token in URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const urlToken = params.token;
    
    if (location.state) {
      const { email, token: stateToken, role, firstName, lastName } = location.state as { 
        email: string; 
        token: string; 
        role: string;
        firstName?: string;
        lastName?: string;
      };
      if (email && stateToken && role === 'admin') {
        setValue('email', email);
        setValue('firstName', firstName || '');
        setValue('lastName', lastName || '');
        setInviteToken(stateToken);
      }
    } else if (urlToken) {
      // If token is in URL path params, use it
      setInviteToken(urlToken);
    } else if (token) {
      // If token is in URL query params, use it
      setInviteToken(token);
    } else {
      // No valid invite token found, redirect to login
      navigate('/login', { 
        state: { 
          error: 'Admin registration requires a valid invite link. Please contact an administrator.' 
        } 
      });
    }
  }, [location.state, navigate, params.token]);

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

  const handleAlertClose = () => {
    if (isRegistered) {
      navigate('/login');
    }
    setShowError('alert', false);
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

    if (!values.firstName.match(nameRegex)) {
      setErrorMessage('firstName', InputErrorMessage.INVALID_NAME);
      setShowError('firstName', true);
      isValid = false;
    }
    if (!values.lastName.match(nameRegex)) {
      setErrorMessage('lastName', InputErrorMessage.INVALID_NAME);
      setShowError('lastName', true);
      isValid = false;
    }
    if (!values.email.match(emailRegex)) {
      setErrorMessage('email', InputErrorMessage.INVALID_EMAIL);
      setShowError('email', true);
      isValid = false;
    }
    if (!values.password.match(passwordRegex)) {
      setErrorMessage('password', InputErrorMessage.INVALID_PASSWORD);
      setShowError('password', true);
      isValid = false;
    }
    if (!(values.confirmPassword === values.password)) {
      setErrorMessage('confirmPassword', InputErrorMessage.PASSWORD_MISMATCH);
      setShowError('confirmPassword', true);
      isValid = false;
    }

    return isValid;
  };

  async function handleSubmit() {
    if (!inviteToken) {
      setShowError('alert', true);
      setErrorMessage('alert', 'Admin registration requires a valid invite token');
      return;
    }
    
    if (validateInputs()) {
      registerInvite(values.firstName, values.lastName, values.email, values.password, inviteToken)
        .then(() => {
          setShowError('alert', true);
          setAlertTitle('');
          setRegistered(true);
          setErrorMessage('alert', 'Account created successfully!');
        })
        .catch((e) => {
          setShowError('alert', true);
          setErrorMessage('alert', e.message);
        });
    }
  }

  const title = "Let's get started";
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
            <Grid container direction="column" alignItems="center" spacing={2}>
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
                  Welcome Admin
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray }}
                >
                  Create your admin account
                </Typography>
              </Grid>
              <Grid item container sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      error={showError.firstName}
                      helperText={errorMessage.firstName}
                      type="text"
                      required
                      label="First Name"
                      value={values.firstName}
                      onChange={(e) => setValue('firstName', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.primaryBlue,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      error={showError.lastName}
                      helperText={errorMessage.lastName}
                      type="text"
                      required
                      label="Last Name"
                      value={values.lastName}
                      onChange={(e) => setValue('lastName', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.primaryBlue,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
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
                  disabled={true}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: inviteToken ? COLORS.gray : COLORS.primaryBlue,
                      },
                      '&.Mui-disabled': {
                        backgroundColor: COLORS.lightGray,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item container sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      error={showError.confirmPassword}
                      helperText={errorMessage.confirmPassword}
                      type="password"
                      required
                      label="Confirm Password"
                      value={values.confirmPassword}
                      onChange={(e) =>
                        setValue('confirmPassword', e.target.value)
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.primaryBlue,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ width: '100%', mt: 1 }}>
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
                  Register
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

export default RegisterPage;
