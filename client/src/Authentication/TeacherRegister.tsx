import React, { useState, useEffect } from 'react';
import { Link, TextField, Grid, Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import FormCol from '../components/form/FormCol';
import {
  emailRegex,
  InputErrorMessage,
  nameRegex,
  passwordRegex,
} from '../util/inputvalidation';
import { register, registerInvite } from './api';
import AlertDialog from '../components/AlertDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import ScreenGrid from '../components/ScreenGrid';
import FormRow from '../components/form/FormRow';
import FormGrid from '../components/form/FormGrid';
import COLORS from '../assets/colors';

const gradeOptions = ['Elementary School', 'Middle School', 'High School'];
const subjectOptions = [
  'Mathematics',
  'Science',
  'English/Language Arts',
  'Social Studies',
  'History',
  'Geography',
  'Physical Education',
  'Art',
  'Music',
  'Technology',
  'Computer Science',
  'Foreign Language',
  'Special Education',
  'Other'
];

/**
 * A page users visit to be able to register for a new account by inputting
 * fields such as their name, email, and password.
 */
function TeacherRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Default values for state
  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    gradeLevel: '',
    city: '',
    state: '',
    country: '',
    subjects: [] as string[],
    bio: '',
  };
  const defaultShowErrors = {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    alert: false,
    school: false,
    gradeLevel: false,
    city: false,
    state: false,
    country: false,
    subjects: false,
    bio: false,
  };
  const defaultErrorMessages = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    alert: '',
    school: '',
    gradeLevel: '',
    city: '',
    state: '',
    country: '',
    subjects: '',
    bio: '',
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
      if (email && token && role === 'teacher') {
        setValue('email', email);
        setValue('firstName', firstName || '');
        setValue('lastName', lastName || '');
        setInviteToken(token);
      }
    }
  }, [location.state]);

  // Helper functions for changing only one field in a state object
  const setValue = (field: string, value: string | string[]) => {
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

    // Check required text fields
    const requiredTextFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'school', 'gradeLevel', 'city', 'country', 'bio'];
    
    for (const field of requiredTextFields) {
      const value = values[field as keyof typeof values];
      if (typeof value === 'string') {
        if (!value || !value.trim()) {
          setErrorMessage(field, InputErrorMessage.MISSING_INPUT);
          setShowError(field, true);
          isValid = false;
        }
      }
    }

    // Check subjects array
    if (!values.subjects || values.subjects.length === 0) {
      setErrorMessage('subjects', 'Please select at least one subject');
      setShowError('subjects', true);
      isValid = false;
    }

    if (values.firstName && !values.firstName.match(nameRegex)) {
      setErrorMessage('firstName', InputErrorMessage.INVALID_NAME);
      setShowError('firstName', true);
      isValid = false;
    }
    if (values.lastName && !values.lastName.match(nameRegex)) {
      setErrorMessage('lastName', InputErrorMessage.INVALID_NAME);
      setShowError('lastName', true);
      isValid = false;
    }
    if (values.email && !values.email.match(emailRegex)) {
      setErrorMessage('email', InputErrorMessage.INVALID_EMAIL);
      setShowError('email', true);
      isValid = false;
    }
    if (values.password && !values.password.match(passwordRegex)) {
      setErrorMessage('password', InputErrorMessage.INVALID_PASSWORD);
      setShowError('password', true);
      isValid = false;
    }
    if (values.confirmPassword && !(values.confirmPassword === values.password)) {
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
        : () => register(values.firstName, values.lastName, values.email, values.password, 'teacher', values.school, values.gradeLevel, values.city, values.state, values.country, values.subjects, values.bio);
      
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

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return (
    <div style={{ 
      minHeight: '150vh', 
      height: '170vh',
      width: '100%',
      background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
      margin: 0,
      padding: 0
    }}>
      <ScreenGrid>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 4,
            paddingTop: 16,
            paddingBottom: 12,
            margin: 0,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              paddingTop: 4,
              borderRadius: 2,
              width: '100%',
              maxWidth: 650,
              background: COLORS.white,
              marginTop: 60,
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
                    Welcome Teacher
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    sx={{ color: COLORS.gray }}
                  >
                    Create your teacher account
                  </Typography>
                </Grid>
                
                {/* Name Fields - 2 per row */}
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

                {/* School and Grade Level - 2 per row */}
                <Grid item container sx={{ width: '100%' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        error={showError.school}
                        helperText={errorMessage.school}
                        type="text"
                        required
                        label="School"
                        value={values.school}
                        onChange={(e) => setValue('school', e.target.value)}
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
                      <FormControl 
                        fullWidth 
                        required 
                        error={showError.gradeLevel}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: COLORS.primaryBlue,
                            },
                          },
                        }}
                      >
                        <InputLabel>Grade Level</InputLabel>
                        <Select
                          value={values.gradeLevel}
                          label="Grade Level"
                          onChange={(e) => setValue('gradeLevel', e.target.value)}
                        >
                          {gradeOptions.map((grade) => (
                            <MenuItem key={grade} value={grade}>
                              {grade}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {showError.gradeLevel && (
                        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                          {errorMessage.gradeLevel}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Location - full width */}
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
                    placeholder="e.g., Philadelphia"
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
                    label="State"
                    value={values.state}
                    onChange={(e) => setValue('state', e.target.value)}
                    placeholder="e.g., PA"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.primaryBlue,
                        },
                      },
                    }}
                  />
                </Grid>
                {/* Country - full width, required */}
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
                    placeholder="e.g., United States"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.primaryBlue,
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Subjects - full width */}
                <Grid item sx={{ width: '100%' }}>
                  <FormControl 
                    fullWidth 
                    required 
                    error={showError.subjects}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.primaryBlue,
                        },
                      },
                    }}
                  >
                    <InputLabel>Subjects Taught</InputLabel>
                    <Select
                      multiple
                      value={values.subjects}
                      label="Subjects Taught"
                      onChange={(e) => {
                        const value = typeof e.target.value === 'string' ? [e.target.value] : e.target.value;
                        setValue('subjects', value);
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {subjectOptions.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showError.subjects && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {errorMessage.subjects}
                    </Typography>
                  )}
                </Grid>

                {/* Bio - full width */}
                <Grid item sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    error={showError.bio}
                    helperText={errorMessage.bio}
                    multiline
                    rows={3}
                    required
                    label="Bio"
                    value={values.bio}
                    onChange={(e) => setValue('bio', e.target.value)}
                    placeholder="Tell us about yourself and your teaching experience..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.primaryBlue,
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Email - full width */}
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

                {/* Password Fields - 2 per row */}
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
                  </Grid>
                </Grid>

                {/* Submit Button */}
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

                {/* Back Link */}
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
    </div>
  );
}

export default TeacherRegisterPage;
