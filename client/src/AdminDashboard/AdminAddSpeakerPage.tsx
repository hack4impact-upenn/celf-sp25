import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  SelectChangeEvent,
  Input,
  Alert,
  Snackbar,
  CircularProgress,
  Select,
  MenuItem,
  Chip,
  FormControl,
  Checkbox,
} from '@mui/material';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import MultiSelect from './MultiSelect';
import { postData } from '../util/api.tsx';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';

const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];
const speakingFormatOptions = ['In-Person', 'Virtual'];
const gradeOptions = ['Elementary School', 'Middle School', 'High School'];

interface SpeakerFormState {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  bio: string;
  location: string;
  jobTitle: string;
  website: string;
  speakingFormats: string[];
  gradeSpecialties: string[];
  industryFocuses: string[];
  languages: string[];
  picture: string | null;
}

const initialFormState: SpeakerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  bio: '',
  location: '',
  speakingFormats: [],
  jobTitle: '',
  website: '',
  gradeSpecialties: [],
  industryFocuses: [],
  languages: [],
  picture: null,
};

function AdminUsersPage() {
  const [formState, setFormState] =
    React.useState<SpeakerFormState>(initialFormState);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);
  const [industryFocusError, setIndustryFocusError] = useState<string | null>(null);

  // Fetch industry focuses on component mount
  useEffect(() => {
    const fetchIndustryFocuses = async () => {
      try {
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
        setIndustryFocusError(null);
      } catch (error) {
        console.error('Failed to fetch industry focuses:', error);
        setIndustryFocusError('Failed to load industry focuses. Please try again later.');
      } finally {
        setLoadingFocuses(false);
      }
    };

    fetchIndustryFocuses();
  }, []);

  // Update text/textarea fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update checkbox selections for speaking formats
  const handleSpeakingFormatChange = (format: string) => {
    setFormState((prev) => ({
      ...prev,
      speakingFormats: prev.speakingFormats.includes(format)
        ? prev.speakingFormats.filter(f => f !== format)
        : [...prev.speakingFormats, format],
    }));
  };

  // Update checkbox selections for grade specialties
  const handleGradeSpecialtyChange = (grade: string) => {
    setFormState((prev) => ({
      ...prev,
      gradeSpecialties: prev.gradeSpecialties.includes(grade)
        ? prev.gradeSpecialties.filter(g => g !== grade)
        : [...prev.gradeSpecialties, grade],
    }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string | string[]>,
    name: string,
  ) => {
    const {
      target: { value },
    } = event;
    setFormState((prev) => ({
      ...prev,
      // On autofill we get a stringified value.
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user first
      const userPayload = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        password: 'tempPassword123!', // This will be changed by the user
        role: 'speaker',
      };

      console.log('Creating user with payload:', userPayload);
      const userResponse = await postData('auth/register', userPayload);
      if (userResponse.error) {
        throw new Error(userResponse.error.message);
      }
      console.log('User created:', userResponse.data);

      // Parse location into city and state
      const locationParts = formState.location.split(',').map((part) => part.trim());
      const city = locationParts[0] || 'Unknown';
      const state = locationParts[1] || 'Unknown';

      // Map grade specialties to the expected format
      const mappedGrades = formState.gradeSpecialties.map(grade => {
        switch (grade) {
          case 'Elementary School':
            return 'Elementary';
          case 'Middle School':
            return 'Middle School';
          case 'High School':
            return 'High School';
          default:
            return grade;
        }
      });

      // Map speaking formats to inperson/virtual booleans
      const inperson = formState.speakingFormats.includes('In-Person');
      const virtual = formState.speakingFormats.includes('Virtual');

      const speakerPayload = {
        userId: userResponse.data._id,
        organization: formState.organization || 'Unknown',
        bio: formState.bio || 'No bio provided',
        location: formState.location || 'Unknown',
        inperson,
        virtual,
        imageUrl: formState.picture || undefined,
        industry:
          formState.industryFocuses.length > 0
            ? formState.industryFocuses
            : ['Other'],
        grades: mappedGrades,
        city,
        state,
        languages: formState.languages.length > 0 ? formState.languages : ['English'],
      };

      console.log('Creating speaker with payload:', speakerPayload);
      const speakerResponse = await postData('speaker/create', speakerPayload);
      if (speakerResponse.error) {
        throw new Error(speakerResponse.error.message);
      }
      console.log('Speaker created:', speakerResponse.data);

      // Reset form after successful submission
      setFormState(initialFormState);
      setSuccess('Speaker created successfully!');
    } catch (error) {
      console.error('Error creating speaker:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while creating the speaker.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />

      {/* Main Content Area */}
      <Box className="main-window">
        <Typography variant="h4" gutterBottom>
          Speaker Submission Form
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2, // vertical spacing between fields
          }}
        >
          <TextField
            label="First Name"
            name="firstName"
            value={formState.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formState.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Job Title (optional)"
            name="jobTitle"
            value={formState.jobTitle}
            onChange={handleChange}
          />
          <TextField
            label="LinkedIn/Website (optional)"
            name="website"
            value={formState.website}
            onChange={handleChange}
          />
          <TextField
            label="Organization"
            name="organization"
            value={formState.organization}
            onChange={handleChange}
            required
          />
          <TextField
            label="Bio (optional)"
            name="bio"
            multiline
            rows={3}
            variant="outlined"
            value={formState.bio}
            onChange={handleChange}
          />
          <MultiSelect
            label="Industry Focus"
            selectOptions={industryFocuses.map(focus => focus.name)}
            handleChange={(e) => handleSelectChange(e, 'industryFocuses')}
            value={formState.industryFocuses}
            loading={loadingFocuses}
            error={industryFocusError}
          />
          <FormControl fullWidth>
            <FormLabel component="legend">Languages</FormLabel>
            <Select
              multiple
              value={formState.languages}
              onChange={(e) => handleSelectChange(e, 'languages')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Location (optional)"
            name="location"
            value={formState.location}
            onChange={handleChange}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">
              Preferred Speaking Format (optional)
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {speakingFormatOptions.map((format) => (
                <FormControlLabel
                  key={format}
                  control={
                    <Checkbox
                      checked={formState.speakingFormats.includes(format)}
                      onChange={() => handleSpeakingFormatChange(format)}
                    />
                  }
                  label={format}
                />
              ))}
            </Box>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">
              Age/Grade Specialty (optional)
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {gradeOptions.map((grade) => (
                <FormControlLabel
                  key={grade}
                  control={
                    <Checkbox
                      checked={formState.gradeSpecialties.includes(grade)}
                      onChange={() => handleGradeSpecialtyChange(grade)}
                    />
                  }
                  label={grade}
                />
              ))}
            </Box>
          </FormControl>
          <Typography variant="subtitle1">Profile Picture</Typography>
          <input type="file" onChange={handleFileChange} name="picture" />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !!industryFocusError}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Creating Speaker...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default AdminUsersPage;
