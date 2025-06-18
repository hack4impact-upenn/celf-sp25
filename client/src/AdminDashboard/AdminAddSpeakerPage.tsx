import React from 'react';
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
} from '@mui/material';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import MultiSelect from './MultiSelect';
import { postData } from '../util/api.tsx';

const industryFocuses = [
  'Clean Energy',
  'Climate Policy',
  'Biodiversity',
  'Environmental Justice',
  'Food Systems',
  'Waste Management',
  'Urban Planning',
  'Outdoor Education',
  'Sustainable Agriculture',
  'Marine Science',
  'Air Quality',
  'Community Advocacy',
  'Green Technology',
  'Corporate Sustainability',
  'Public Service',
  'Other',
];

const areasOfExpertise = [
  'Clean Energy',
  'Climate Policy',
  'Biodiversity',
  'Environmental Justice',
  'Food Systems',
  'Waste Management',
  'Urban Planning',
  'Outdoor Education',
  'Sustainable Agriculture',
  'Marine Science',
  'Air Quality',
  'Community Advocacy',
  'Green Technology',
  'Corporate Sustainability',
  'Public Service',
  'Other',
];

interface SpeakerFormState {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  bio: string;
  location: string;
  jobTitle: string;
  website: string;
  speakingFormat: 'in-person' | 'virtual' | 'both' | '';
  ageSpecialty: 'elementary' | 'middle' | 'high school' | 'all grades' | '';
  industryFocuses: string[];
  expertise: string[];
  picture: string | null;
}

const initialFormState: SpeakerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  bio: '',
  location: '',
  speakingFormat: '',
  jobTitle: '',
  website: '',
  ageSpecialty: '',
  industryFocuses: [],
  expertise: [],
  picture: null,
};

function AdminUsersPage() {
  const [formState, setFormState] =
    React.useState<SpeakerFormState>(initialFormState);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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

  // Update radio button for speaking format
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value as 'in-person' | 'virtual' | 'both',
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
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Create a user using the register endpoint
      const userPayload = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        password: 'tempPassword123@',
      };

      console.log('Creating user with payload:', userPayload);
      const userResponse = await postData('auth/register', userPayload);
      if (userResponse.error) {
        throw new Error(userResponse.error.message);
      }
      console.log('User created:', userResponse.data);

      const mappedGrades = formState.ageSpecialty
        ? [formState.ageSpecialty].map((grade) => {
            switch (grade) {
              case 'elementary':
                return 'Elementary';
              case 'middle':
                return 'Middle School';
              case 'high school':
                return 'High School';
              case 'all grades':
                return 'Elementary'; // Default to Elementary for all grades
              default:
                return 'Elementary';
            }
          })
        : [];

      // Parse location into city and state
      const locationParts = formState.location
        .split(',')
        .map((part) => part.trim());
      const city = locationParts[0] || 'Unknown';
      const state = locationParts[1] || 'Unknown';

      const speakerPayload = {
        userId: userResponse.data._id,
        organization: formState.organization || 'Unknown',
        bio: formState.bio || 'No bio provided',
        location: formState.location || 'Unknown',
        inperson:
          formState.speakingFormat === 'in-person' ||
          formState.speakingFormat === 'both',
        virtual:
          formState.speakingFormat === 'virtual' ||
          formState.speakingFormat === 'both',
        imageUrl: formState.picture || undefined,
        industry:
          formState.industryFocuses.length > 0
            ? formState.industryFocuses
            : ['Other'],
        grades: mappedGrades,
        city,
        state,
        languages: ['English'],
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
            selectOptions={industryFocuses}
            handleChange={(e) => handleSelectChange(e, 'industryFocuses')}
            value={formState.industryFocuses}
          />
          <MultiSelect
            label="Areas of Expertise"
            selectOptions={areasOfExpertise}
            handleChange={(e) => handleSelectChange(e, 'expertise')}
            value={formState.expertise}
          />
          <TextField
            label="Location (optional)"
            name="location"
            value={formState.location}
            onChange={handleChange}
          />

          <FormLabel component="legend">
            Preferred Speaking Format (optional)
          </FormLabel>
          <RadioGroup
            row
            name="speakingFormat"
            value={formState.speakingFormat}
            onChange={handleRadioChange}
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
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>

          <FormLabel component="legend">
            Age/Grade Specialty (optional)
          </FormLabel>
          <RadioGroup
            row
            name="ageSpecialty"
            value={formState.ageSpecialty}
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
          <Typography variant="subtitle1">Profile Picture</Typography>
          <input type="file" onChange={handleFileChange} name="picture" />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
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
