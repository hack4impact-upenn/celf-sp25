import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  CircularProgress,
  Paper,
  OutlinedInput,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { postData, getData } from '../util/api';
import { processImageUpload } from '../util/imageCompression';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';
import ScreenGrid from '../components/ScreenGrid';
import AlertDialog from '../components/AlertDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import COLORS from '../assets/colors';
import TopBar from '../components/top_bar/TopBar';

// same as admin side
const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];

// MultiSelect menu props
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface SpeakerInfoFormState {
  jobTitle: string;
  website: string;
  organization: string;
  bio: string;
  city: string;
  state: string;
  country?: string;
  speakingFormat: 'in-person' | 'virtual' | 'both' | '';
  ageSpecialty: 'elementary' | 'middle' | 'high school' | 'all grades' | '';
  industryFocuses: string[];
  languages: string[];
  picture: string | null;
}

const initialFormState: SpeakerInfoFormState = {
  jobTitle: '',
  website: '',
  organization: '',
  bio: '',
  city: '',
  state: '',
  country: '',
  speakingFormat: '',
  ageSpecialty: '',
  industryFocuses: [],
  languages: [],
  picture: null,
};

function SpeakerSubmitInfoPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formState, setFormState] =
    useState<SpeakerInfoFormState>(initialFormState);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch industry focuses on component mount
  useEffect(() => {
    const fetchIndustryFocuses = async () => {
      try {
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
      } catch (error) {
        console.error('Failed to fetch industry focuses:', error);
        setError('Failed to load industry focuses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryFocuses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string[]>,
    name: string,
  ) => {
    const {
      target: { value },
    } = event;
    setFormState((prev) => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Handle file upload for profile picture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await processImageUpload(file);
        setFormState((prev) => ({
          ...prev,
          picture: compressedImage,
        }));
      } catch (error) {
        console.error('Error compressing image:', error);
        setAlertTitle('Error');
        setAlertMessage('Failed to compress profile picture. Please try again.');
        setShowAlert(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation
    if (!formState.jobTitle.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Job Title is required');
      setShowAlert(true);
      return;
    }

    if (!formState.organization.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Organization is required');
      setShowAlert(true);
      return;
    }

    if (!formState.bio.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Bio is required');
      setShowAlert(true);
      return;
    }

    if (!formState.city.trim()) {
      setAlertTitle('Error');
      setAlertMessage('City is required');
      setShowAlert(true);
      return;
    }

    if (!formState.state.trim()) {
      setAlertTitle('Error');
      setAlertMessage('State is required');
      setShowAlert(true);
      return;
    }

    if (!formState.speakingFormat) {
      setAlertTitle('Error');
      setAlertMessage('Please select a speaking format');
      setShowAlert(true);
      return;
    }

    if (!formState.ageSpecialty) {
      setAlertTitle('Error');
      setAlertMessage('Please select an age/grade specialty');
      setShowAlert(true);
      return;
    }

    if (formState.industryFocuses.length === 0) {
      setAlertTitle('Error');
      setAlertMessage('Please select at least one industry focus');
      setShowAlert(true);
      return;
    }

    if (formState.languages.length === 0) {
      setAlertTitle('Error');
      setAlertMessage('Please select at least one language');
      setShowAlert(true);
      return;
    }

    try {
      const payload = {
        title: formState.jobTitle,
        personalSite: formState.website,
        organisation: formState.organization,
        bio: formState.bio,
        city: formState.city,
        state: formState.state,
        country: formState.country,
        speakingFormat: formState.speakingFormat,
        ageGroup: formState.ageSpecialty,
        industryFocus: formState.industryFocuses,
        languages: formState.languages.length > 0 ? formState.languages : ['English'],
        areaOfExpertise: [], // TODO: add availability feature
        picture: formState.picture,
      };

      const response = await postData('speaker/profile', payload);

      if (response.error) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response.error),
        );
      }

      setAlertTitle('Success');
      setAlertMessage('Your information has been submitted successfully!');
      setIsSubmitted(true);
      setShowAlert(true);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage(
        error instanceof Error ? error.message : 'An error occurred',
      );
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (isSubmitted) {
      navigate('/speaker-dashboard'); // Navigate to speaker dashboard after successful submission
    }
  };

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
                  Speaker Profile
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray, mb: 3 }}
                >
                  Complete your profile to get connected with educators
                </Typography>
              </Grid>

              {/* Form Fields */}
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="jobTitle"
                  value={formState.jobTitle}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formState.organization}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="LinkedIn/Website URL"
                  name="website"
                  value={formState.website}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  value={formState.bio}
                  onChange={handleChange}
                  placeholder="Share your background, expertise, and what inspires you about environmental education"
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formState.city}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formState.state}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formState.country}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Industry Focus MultiSelect */}
              <Grid item sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1 }} required>
                  Industry Focus
                </FormLabel>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : error ? (
                  <Box sx={{ py: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      Please refresh the page or try again later to load industry focuses.
                    </Typography>
                  </Box>
                ) : (
                  <Select
                    fullWidth
                    multiple
                    value={formState.industryFocuses}
                    onChange={(e) => handleSelectChange(e, 'industryFocuses')}
                    input={<OutlinedInput />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                    sx={{ mb: 2 }}
                  >
                    {industryFocuses.map((focus) => (
                      <MenuItem
                        key={focus._id}
                        value={focus.name}
                        style={{
                          fontWeight:
                            formState.industryFocuses.indexOf(focus.name) === -1
                              ? theme.typography.fontWeightRegular
                              : theme.typography.fontWeightMedium,
                        }}
                      >
                        {focus.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Grid>

              {/* Languages MultiSelect */}
              <Grid item sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1 }} required>
                  Languages
                </FormLabel>
                <Select
                  fullWidth
                  multiple
                  value={formState.languages}
                  onChange={(e) => handleSelectChange(e, 'languages')}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  sx={{ mb: 2 }}
                >
                  {languageOptions.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      style={{
                        fontWeight:
                          formState.languages.indexOf(option) === -1
                            ? theme.typography.fontWeightRegular
                            : theme.typography.fontWeightMedium,
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Speaking Format Radio Group */}
              <Grid item sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1 }} required>
                  Preferred Speaking Format
                </FormLabel>
                <RadioGroup
                  row
                  name="speakingFormat"
                  value={formState.speakingFormat}
                  onChange={handleRadioChange}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="in-person"
                    control={<Radio />}
                    label="In-Person"
                  />
                  <FormControlLabel
                    value="virtual"
                    control={<Radio />}
                    label="Virtual"
                  />
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label="Both"
                  />
                </RadioGroup>
              </Grid>

              {/* Age/Grade Specialty Radio Group */}
              <Grid item sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1 }} required>
                  Age/Grade Specialty
                </FormLabel>
                <RadioGroup
                  row
                  name="ageSpecialty"
                  value={formState.ageSpecialty}
                  onChange={handleRadioChange}
                  sx={{ mb: 2 }}
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

              {/* Profile Picture Upload */}
              <Grid item sx={{ width: '100%', mb: 2 }}>
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

              {/* Submit Button */}
              <Grid item sx={{ width: '100%', mt: 2 }}>
                <PrimaryButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !!error}
                  sx={{
                    height: 48,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  Submit Profile
                </PrimaryButton>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Alert Dialog for success/error messages */}
      <AlertDialog
        showAlert={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </div>
  );
}

export default SpeakerSubmitInfoPage;
