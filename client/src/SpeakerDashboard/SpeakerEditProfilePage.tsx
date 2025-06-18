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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import AlertDialog from '../components/AlertDialog.tsx';
import COLORS from '../assets/colors.ts';
import { useData } from '../util/api.tsx';

interface SpeakerProfile {
  picture?: string;
  industry?: string[];
  ageSpecialty?: string;
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

  const response = useData(`/api/speakers/${user.email}`);
  const [formState, setFormState] = useState<SpeakerProfile>({
    picture: '',
    industry: [],
    ageSpecialty: '',
    bio: '',
    city: '',
    state: '',
    languages: [],
    inperson: false,
    virtual: false,
  });

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

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      ageSpecialty: e.target.value,
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
      // TODO: Implement profile update API call
      setAlertTitle('Success');
      setAlertMessage('Your profile has been updated successfully!');
      setShowAlert(true);
      navigate('/profile');
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

              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formState.bio || ''}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              {/* Industry */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formState.industry?.join(', ') || ''}
                  onChange={handleChange}
                  helperText="Enter industries separated by commas"
                />
              </Grid>

              {/* Age/Grade Specialty */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Age/Grade Specialty
                </FormLabel>
                <RadioGroup
                  row
                  name="ageSpecialty"
                  value={formState.ageSpecialty || ''}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel
                    value="elementary"
                    control={<Radio />}
                    label="Elementary School"
                  />
                  <FormControlLabel
                    value="middle"
                    control={<Radio />}
                    label="Middle School"
                  />
                  <FormControlLabel
                    value="high school"
                    control={<Radio />}
                    label="High School"
                  />
                  <FormControlLabel
                    value="all grades"
                    control={<Radio />}
                    label="All Grades"
                  />
                </RadioGroup>
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
                <TextField
                  fullWidth
                  label="Languages"
                  name="languages"
                  value={formState.languages?.join(', ') || ''}
                  onChange={handleChange}
                  helperText="Enter languages separated by commas"
                />
              </Grid>

              {/* Speaking Formats */}
              <Grid item xs={12}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Speaking Formats
                </FormLabel>
                <FormControlLabel
                  control={
                    <Radio
                      checked={formState.inperson}
                      onChange={handleChange}
                      name="inperson"
                    />
                  }
                  label="In-person"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={formState.virtual}
                      onChange={handleChange}
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
