import React, { useState, useEffect } from 'react';
import { Link, TextField, Grid, Typography, Paper, Box } from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
function SpeakerRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Default values for state
  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    city: '',
    state: '',
    country: '',
  };
  const defaultShowErrors = {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    alert: false,
    organization: false,
    city: false,
    state: false,
    country: false,
  };
  const defaultErrorMessages = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    alert: '',
    organization: '',
    city: '',
    state: '',
    country: '',
  };
  type ValueType = keyof typeof values;

  // State values and hooks
  const [values, setValueState] = useState(defaultValues);
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);
  const [alertTitle, setAlertTitle] = useState('Error');
  const [isRegistered, setRegistered] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Handle invite data from navigation state
  useEffect(() => {
    if (location.state) {
      const { email, token, role, firstName, lastName } = location.state as { 
        email: string; 
        token: string; 
        role: string;
        firstName?: string;
        lastName?: string;
      };
      if (email && token && role === 'speaker') {
        setValue('email', email);
        setValue('firstName', firstName || '');
        setValue('lastName', lastName || '');
        setInviteToken(token);
      }
    }
  }, [location.state]);

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
    if (validateInputs()) {
      const registerFunction = inviteToken 
        ? () => registerInvite(values.firstName, values.lastName, values.email, values.password, inviteToken)
        : () => register(values.firstName, values.lastName, values.email, values.password, 'speaker', undefined, undefined, values.city, values.state, values.country, undefined, undefined, values.organization);
      
      registerFunction()
        .then(() => {
          setShowError('alert', true);
          setAlertTitle('');
          setRegistered(true);
          setErrorMessage('alert', inviteToken ? 'Account created successfully!' : 'Check email to verify account');
        })
        .catch((e) => {
          setShowError('alert', true);
          setErrorMessage('alert', e.message);
        });
    }
  }

  return (
    <ScreenGrid>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
          minHeight: '200vh',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 4,
          paddingTop: 50,
          paddingBottom: 16,
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
            marginTop: 2,
            marginBottom: 2,
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
                  Welcome Speaker
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray }}
                >
                  Create your speaker account
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
                  error={showError.organization}
                  helperText={errorMessage.organization}
                  type="text"
                  required
                  label="Organization"
                  value={values.organization}
                  onChange={(e) => setValue('organization', e.target.value)}
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
                  error={showError.city}
                  helperText={errorMessage.city}
                  type="text"
                  required
                  label="City"
                  value={values.city}
                  onChange={(e) => setValue('city', e.target.value)}
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
                  error={showError.state}
                  helperText={errorMessage.state}
                  type="text"
                  required
                  label="State"
                  value={values.state}
                  onChange={(e) => setValue('state', e.target.value)}
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
                  error={showError.country}
                  helperText={errorMessage.country}
                  type="text"
                  required
                  label="Country"
                  value={values.country}
                  onChange={(e) => setValue('country', e.target.value)}
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
                  error={showError.email}
                  helperText={errorMessage.email}
                  type="email"
                  required
                  label="Email"
                  value={values.email}
                  onChange={(e) => setValue('email', e.target.value)}
                  disabled={!!inviteToken}
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

export default SpeakerRegisterPage;
