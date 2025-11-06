import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  SelectChangeEvent,
  Divider,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../util/redux/hooks';
import { selectUser, login } from '../util/redux/userSlice';
import TopBar from '../components/top_bar/TopBar';
import { getData, putData } from '../util/api';
import COLORS from '../assets/colors';

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

const gradeOptions = ['Elementary School', 'Middle School', 'High School'];

interface TeacherProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  school?: string;
  gradeLevel?: string;
  subjects?: string[];
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  picture?: string;
  userId?: string | { _id?: string; id?: string };
}

const initialFormState: TeacherProfile = {
  firstName: '',
  lastName: '',
  email: '',
  school: '',
  gradeLevel: '',
  subjects: [],
  bio: '',
  city: '',
  state: '',
  country: '',
  picture: '',
};

function TeacherProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [formState, setFormState] = useState<TeacherProfile>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');

  // Fetch teacher profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First get all teachers to find the current user's teacher profile
        const response = await getData('teacher/all');
        if (response.error) {
          setError('Failed to load profile data');
        } else {
          // Find the teacher profile that matches the current user's email
          const teachers = response.data || [];
          const currentTeacher = teachers.find((teacher: any) => 
            teacher.userId?.email === user.email
          );
          
          if (currentTeacher) {
            console.log('currentTeacher:', currentTeacher);
            setFormState({
              ...currentTeacher,
              // Preserve user data from the populated userId field
              firstName: currentTeacher.userId?.firstName || user.firstName || '',
              lastName: currentTeacher.userId?.lastName || user.lastName || '',
              email: currentTeacher.userId?.email || user.email || '',
            });
            setCityInput(currentTeacher.city || '');
            setStateInput(currentTeacher.state || '');
          } else {
            // No teacher profile found, use user data for names
            setFormState({
              ...initialFormState,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
            });
          }
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    setFormState(prev => ({
      ...prev,
      city: value || '',
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStateInput(value);
    setFormState(prev => ({
      ...prev,
      state: value || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate required fields
    const requiredFields = [];
    if (!formState.city || formState.city.trim() === '') {
      requiredFields.push('City');
    }
    if (!formState.country || formState.country.trim() === '') {
      requiredFields.push('Country');
    }
    if (!formState.bio || formState.bio.trim() === '') {
      requiredFields.push('Bio');
    }
    if (!formState.subjects || formState.subjects.length === 0) {
      requiredFields.push('Subjects');
    }

    if (requiredFields.length > 0) {
      setError(`Please fill in the following required fields: ${requiredFields.join(', ')}`);
      setSaving(false);
      return;
    }

    try {
      const userId = user._id;
      const updateResponse = await putData(`teacher/update/${userId}`, formState);
      
      if (updateResponse.error) {
        setError(updateResponse.error.message || 'Failed to update profile');
      } else {
        // Fetch latest user info and update Redux
        const userRes = await getData(`user/${userId}`); // or your endpoint for current user
        if (userRes && userRes.data) {
          dispatch(login({
            _id: userRes.data._id,
            email: userRes.data.email,
            firstName: userRes.data.firstName,
            lastName: userRes.data.lastName,
            admin: userRes.data.admin,
            role: userRes.data.role,
          }));
        }
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);

  if (loading) {
    return (
      <div className="flex-div">
        <TopBar />
        <div className="main-window">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#E6FAFC', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', pt: 10 }}>
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 900,
            p: 3,
            borderRadius: 2,
            backgroundColor: COLORS.white,
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
            Edit Profile
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formState.firstName || ''}
                      onChange={handleChange}
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formState.lastName || ''}
                      onChange={handleChange}
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email || ''}
                      onChange={handleChange}
                      required
                      disabled
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              
              {/* School Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>School Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="School"
                      name="school"
                      value={formState.school || ''}
                      onChange={handleChange}
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Grade Level</InputLabel>
                      <Select
                        name="gradeLevel"
                        value={formState.gradeLevel || ''}
                        onChange={handleSelectChange}
                        label="Grade Level"
                        size="medium"
                      >
                        {gradeOptions.map((gradeLevel) => (
                          <MenuItem key={gradeLevel} value={gradeLevel}>
                            {gradeLevel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              {/* Subjects Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Subjects Taught</Typography>
                <FormControl fullWidth required>
                  <InputLabel>Select Subjects</InputLabel>
                  <Select
                    multiple
                    value={formState.subjects || []}
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? [e.target.value] : e.target.value;
                      setFormState(prev => ({
                        ...prev,
                        subjects: value,
                      }));
                    }}
                    label="Select Subjects"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" color="primary" />
                        ))}
                      </Box>
                    )}
                    size="medium"
                    required
                  >
                    {subjectOptions.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              {/* Bio Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>About Me</Typography>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formState.bio || ''}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Tell us about yourself, your teaching experience, and what you're passionate about..."
                  size="medium"
                  required
                />
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              {/* Location Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Location</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={cityInput}
                      onChange={handleCityChange}
                      placeholder="e.g., Philadelphia"
                      size="medium"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={stateInput}
                      onChange={handleStateChange}
                      placeholder="e.g., PA"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formState.country || ''}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      size="medium"
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/home')}
                    disabled={saving}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      height: 48,
                      fontSize: '1rem',
                      textTransform: 'none',
                      backgroundColor: COLORS.primaryBlue,
                      '&:hover': {
                        backgroundColor: COLORS.primaryDark,
                      },
                    }}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TeacherProfilePage; 