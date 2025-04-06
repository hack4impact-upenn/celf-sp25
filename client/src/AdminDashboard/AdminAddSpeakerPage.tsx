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
} from '@mui/material';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import MultiSelect from './MultiSelect';

const industryFocuses = [
  'Clean Energy',
  'Conservation',
  'Sustainable Food Systems',
  'Waste Management',
  'Environmental Justice',
  'Climate Change Policy',
  'Green Building & Architecture',
  'Circular Economy',
  'Community Organizing',
  'Wildlife Protection',
  'Marine Conservation',
  'Urban Planning',
  'Sustainable Agriculture',
  'Water Resources',
  'Transportation & Mobility',
  'Public Health & Environment',
  'Forestry',
  'Environmental Education',
  'Carbon Capture & Storage',
  'Renewable Energy Finance',
  'Environmental Technology',
  'Ecotourism',
  'Environmental Law & Policy',
  'Government',
  'Nonprofit & Advocacy',
];

const areasOfExpertise = [
  'Marine Biology',
  'Clean Energy',
  'Circularity',
  'Sustainable Food Systems',
  'Environmental Education',
  'Climate Science',
  'Green Architecture',
  'Urban Planning',
  'Ecology',
  'Water Conservation',
  'Air Quality Monitoring',
  'Wildlife Conservation',
  'Environmental Policy',
  'Community Engagement',
  'Renewable Energy Engineering',
  'Carbon Accounting',
  'Environmental Justice',
  'Energy Systems',
  'Composting',
  'Soil Science',
  'Forestry',
  'Fisheries Management',
  'Agricultural Technology',
  'Waste Reduction',
  'Sustainability Consulting',
  'Public Health & Environment',
  'Circular Economy Design',
  'Geospatial Analysis (GIS)',
  'Environmental Law',
  'Climate Adaptation Strategies',
  'Environmental Communication',
  'Green Finance',
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
  picture: Uint8Array | null;
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
    event: SelectChangeEvent<string>,
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
      const { name, value } = e.target;

      const arrayBuffer = await file.arrayBuffer(); // read file as ArrayBuffer
      const bytes = new Uint8Array(arrayBuffer); // convert to byte array

      setFormState((prev) => ({
        ...prev,
        [name]: bytes,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with your submission logic (e.g., API call)
    console.log('Form submitted:', formState);
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
            sx={{ alignSelf: 'flex-start' }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default AdminUsersPage;
