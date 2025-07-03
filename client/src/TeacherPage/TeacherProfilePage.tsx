import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import TopBar from '../components/top_bar/TopBar';
import { getData, putData } from '../util/api.tsx';
import COLORS from '../assets/colors.ts';

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

const gradeOptions = ['Elementary', 'Middle School', 'High School'];

interface TeacherProfile {
  school?: string;
  grade?: string;
  subjects?: string[];
  bio?: string;
  city?: string;
  state?: string;
  picture?: string;
}

const initialFormState: TeacherProfile = {
  school: '',
  grade: '',
  subjects: [],
  bio: '',
  city: '',
  state: '',
  picture: '',
};

function TeacherProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [formState, setFormState] = useState<TeacherProfile>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch teacher profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getData(`/api/teachers/${user.email}`);
        if (response.error) {
          setError('Failed to load profile data');
        } else {
          setFormState(response.data || initialFormState);
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

  const handleSubjectChange = (subject: string) => {
    setFormState(prev => ({
      ...prev,
      subjects: prev.subjects?.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...(prev.subjects || []), subject],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormState(prev => ({
          ...prev,
          picture: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await putData(`/api/teachers/${user.email}`, formState);
      if (response.error) {
        setError(response.error.message || 'Failed to update profile');
      } else {
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
              {/* Profile Picture Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ color: COLORS.primaryDark, mb: 2 }}
                >
                  Profile Picture
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ marginBottom: '16px' }}
                />
                {formState.picture && (
                  <Box
                    component="img"
                    src={formState.picture}
                    alt="Profile"
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: '2px solid #e0e0e0',
                    }}
                  />
                )}
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
                      <FormLabel component="legend">Grade Level</FormLabel>
                      <Select
                        name="grade"
                        value={formState.grade || ''}
                        onChange={handleSelectChange}
                        displayEmpty
                        size="medium"
                      >
                        <MenuItem value="" disabled>
                          Select Grade Level
                        </MenuItem>
                        {gradeOptions.map((grade) => (
                          <MenuItem key={grade} value={grade}>
                            {grade}
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
                <FormGroup row sx={{ gap: 2 }}>
                  {subjectOptions.map((subject) => (
                    <FormControlLabel
                      key={subject}
                      control={
                        <Checkbox
                          checked={formState.subjects?.includes(subject) || false}
                          onChange={() => handleSubjectChange(subject)}
                          size="medium"
                        />
                      }
                      label={subject}
                    />
                  ))}
                </FormGroup>
                {formState.subjects && formState.subjects.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {formState.subjects.map((subject) => (
                      <Chip
                        key={subject}
                        label={subject}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
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
                      value={formState.city || ''}
                      onChange={handleChange}
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formState.state || ''}
                      onChange={handleChange}
                      required
                      size="medium"
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