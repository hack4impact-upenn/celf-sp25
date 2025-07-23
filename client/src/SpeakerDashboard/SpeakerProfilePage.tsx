import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import TopBar from '../components/top_bar/TopBar.tsx';
import COLORS from '../assets/colors.ts';
import { getData, putData } from '../util/api.tsx';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';

const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];
const gradeOptions = ['Elementary', 'Middle School', 'High School'];

interface SpeakerProfile {
  picture?: string;
  organization?: string;
  industry?: string[];
  grades?: string[];
  bio?: string;
  city?: string;
  state?: string;
  languages?: string[];
  inperson?: boolean;
  virtual?: boolean;
  jobTitle?: string;
  website?: string;
}

const initialFormState: SpeakerProfile = {
  picture: '',
  organization: '',
  industry: [],
  grades: [],
  bio: '',
  city: '',
  state: '',
  languages: [],
  inperson: false,
  virtual: false,
  jobTitle: '',
  website: '',
};

function SpeakerProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [formState, setFormState] = useState<SpeakerProfile>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);

  // Fetch speaker profile data and industry focuses
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const profileResponse = await getData('speaker/profile');
        if (profileResponse.error) {
          setError('Failed to load profile data');
        } else {
          setFormState(profileResponse.data || initialFormState);
        }

        // Fetch industry focuses
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
        setLoadingFocuses(false);
      }
    };

    fetchData();
  }, [user.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target as { name: string; value: string | string[] };
    setFormState(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleCheckboxChange = (field: keyof Pick<SpeakerProfile, 'industry' | 'grades' | 'languages'>, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field]?.filter(v => v !== value)
        : [...(prev[field] || []), value],
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
      const response = await putData('speaker/profile', formState);
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
    <div style={{ minHeight: '100vh', background: '#E6FAFC', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '80vh',
          pt: 10,
        }}
      >
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
              {/* Organization Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Organization Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Organization"
                      name="organization"
                      value={formState.organization || ''}
                      onChange={handleChange}
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="jobTitle"
                      value={formState.jobTitle || ''}
                      onChange={handleChange}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={formState.website || ''}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              {/* Expertise Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Expertise & Focus Areas</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Industry Focus
                    </Typography>
                    <FormGroup row sx={{ gap: 2 }}>
                      {industryFocuses.map((focus) => (
                        <FormControlLabel
                          key={focus._id}
                          control={
                            <Checkbox
                              checked={formState.industry?.includes(focus.name) || false}
                              onChange={() => handleCheckboxChange('industry', focus.name)}
                              size="medium"
                            />
                          }
                          label={focus.name}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Grade Levels
                    </Typography>
                    <FormGroup row sx={{ gap: 2 }}>
                      {gradeOptions.map((grade) => (
                        <FormControlLabel
                          key={grade}
                          control={
                            <Checkbox
                              checked={formState.grades?.includes(grade) || false}
                              onChange={() => handleCheckboxChange('grades', grade)}
                              size="medium"
                            />
                          }
                          label={grade}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Languages
                    </Typography>
                    <FormGroup row sx={{ gap: 2 }}>
                      {languageOptions.map((language) => (
                        <FormControlLabel
                          key={language}
                          control={
                            <Checkbox
                              checked={formState.languages?.includes(language) || false}
                              onChange={() => handleCheckboxChange('languages', language)}
                              size="medium"
                            />
                          }
                          label={language}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                </Grid>
                {(formState.industry?.length || formState.grades?.length || formState.languages?.length) && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {formState.industry?.map((industry) => (
                      <Chip
                        key={industry}
                        label={industry}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {formState.grades?.map((grade) => (
                      <Chip
                        key={grade}
                        label={grade}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                    {formState.languages?.map((language) => (
                      <Chip
                        key={language}
                        label={language}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
              {/* Speaking Formats Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>Speaking Formats</Typography>
                <FormGroup row sx={{ gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.inperson || false}
                        onChange={() => handleFormatChange('inperson')}
                        size="medium"
                      />
                    }
                    label="In-Person"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.virtual || false}
                        onChange={() => handleFormatChange('virtual')}
                        size="medium"
                      />
                    }
                    label="Virtual"
                  />
                </FormGroup>
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
                  placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
                  required
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

export default SpeakerProfilePage;
