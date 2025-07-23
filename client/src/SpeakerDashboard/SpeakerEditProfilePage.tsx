import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Checkbox,
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
import { useData, putData } from '../util/api.tsx';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';

const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];
const gradeOptions = ['Elementary', 'Middle School', 'High School'];

interface SpeakerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  picture?: string;
  organization?: string;
  jobTitle?: string;
  website?: string;
  industry?: string[];
  grades?: string[];
  bio?: string;
  city?: string;
  state?: string;
  languages?: string[];
  inperson?: boolean;
  virtual?: boolean;
}

function SpeakerEditProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);

  const response = useData('speaker/profile');
  const [formState, setFormState] = useState<SpeakerProfile>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    picture: '',
    organization: '',
    jobTitle: '',
    website: '',
    industry: [],
    grades: [],
    bio: '',
    city: '',
    state: '',
    languages: [],
    inperson: false,
    virtual: false,
  });

  // Fetch industry focuses on component mount
  useEffect(() => {
    const fetchIndustryFocuses = async () => {
      try {
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
      } catch (error) {
        console.error('Failed to fetch industry focuses:', error);
      } finally {
        setLoadingFocuses(false);
      }
    };

    fetchIndustryFocuses();
  }, []);

  useEffect(() => {
    if (response?.data) {
      setFormState(response.data);
    }
  }, [response]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target as { name: string; value: string | string[] };
    setFormState(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleGradeChange = (grade: string) => {
    setFormState(prev => ({
      ...prev,
      grades: prev.grades?.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...(prev.grades || []), grade],
    }));
  };

  const handleFormatChange = (format: 'inperson' | 'virtual') => {
    setFormState(prev => ({
      ...prev,
      [format]: !prev[format],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormState((prev) => ({
          ...prev,
          picture: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await putData('speaker/profile', formState);
      if (response.error) {
        setAlertTitle('Error');
        setAlertMessage(response.error.message || 'Failed to update profile. Please try again.');
      } else {
        setAlertTitle('Success');
        setAlertMessage('Your profile has been updated successfully!');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
      setShowAlert(true);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Failed to update profile. Please try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <TopBar />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            marginTop: '64px',
          }}
        >
          <CircularProgress sx={{ color: COLORS.primaryBlue }} />
        </Box>
      </div>
    );
  }

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
          marginTop: '64px',
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
              {/* Name Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formState.firstName || ''}
                  onChange={handleChange}
                  required
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
                />
              </Grid>

              {/* Profile Picture Upload */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Profile Picture
                </FormLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  name="picture"
                />
              </Grid>

              {/* Organization */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formState.organization || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title (optional)"
                  name="jobTitle"
                  value={formState.jobTitle || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="LinkedIn/Website (optional)"
                  name="website"
                  value={formState.website || ''}
                  onChange={handleChange}
                />
              </Grid>

              {/* Industry */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Industry Focus
                </FormLabel>
                <Select
                  fullWidth
                  multiple
                  value={formState.industry || []}
                  onChange={handleSelectChange}
                  name="industry"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  sx={{ minHeight: 48 }}
                >
                  {loadingFocuses ? (
                    <MenuItem disabled>
                      <CircularProgress size="small" />
                    </MenuItem>
                  ) : (
                    industryFocuses.map((focus) => (
                      <MenuItem key={focus._id} value={focus.name}>
                        {focus.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </Grid>

              {/* Grades */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Age/Grade Specialty (optional)
                </FormLabel>
                <Select
                  fullWidth
                  multiple
                  value={formState.grades || []}
                  onChange={(e) => handleSelectChange(e as SelectChangeEvent<string[]>)}
                  name="grades"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  sx={{ minHeight: 48 }}
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio (optional)"
                  name="bio"
                  value={formState.bio || ''}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formState.city || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formState.state || ''}
                  onChange={handleChange}
                />
              </Grid>

              {/* Languages */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Languages
                </FormLabel>
                <Select
                  fullWidth
                  multiple
                  value={formState.languages || []}
                  onChange={(e) => handleSelectChange(e as SelectChangeEvent<string[]>)}
                  name="languages"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  sx={{ minHeight: 48 }}
                >
                  {languageOptions.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Speaking Formats */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Preferred Speaking Format (optional)
                </FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formState.inperson}
                      onChange={() => handleFormatChange('inperson')}
                      name="inperson"
                    />
                  }
                  label="In-person"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formState.virtual}
                      onChange={() => handleFormatChange('virtual')}
                      name="virtual"
                    />
                  }
                  label="Virtual"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    sx={{ height: 48 }}
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
      </Box>

      <AlertDialog
        showAlert={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </div>
  );
}

export default SpeakerEditProfilePage;
