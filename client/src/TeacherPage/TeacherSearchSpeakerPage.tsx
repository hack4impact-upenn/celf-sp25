import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  CardMedia,
  Chip,
  Button,
  Collapse,
  Paper,
  Slide,
  Divider,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Event';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, {
  FilterState,
} from '../components/SpeakerFilterPanel';
import { SelectChangeEvent } from '@mui/material';
import { getData } from '../util/api';
import { createTeacherRequest } from './teacherRequestApi';

interface Speaker {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: string;
  bio: string;
  city: string;
  state: string;
  country?: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
  industry: string[];
  grades: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages: string[];
}

interface BookingRequest {
  id: string;
  eventName: string;
  eventPurpose: string;
  dateTime: string;
  timezone: string;
  isInPerson: boolean;
  isVirtual: boolean;
  expertise: string;
  preferredLanguage: string;
  location: string;
  goals: string;
  budget: string;
  engagementFormat: string;
  status: 'pending' | 'approved' | 'rejected' | 'upcoming' | 'archived';
}

interface BookingFormState {
  // Audience Information
  gradeLevels: string[];
  subjects: string[];
  estimatedStudents: number;

  // Event Details
  eventName: string;
  eventPurpose: string;
  dateTime: string;
  timezone: string;
  isInPerson: boolean;
  isVirtual: boolean;
  additionalInfo?: string;

  // Speaker Preferences
  expertise: string;
  preferredLanguage: string;
  city: string;
  state: string;
  country?: string;
  goals: string;
  budget: string;
  engagementFormat: string;
}

// Styled components
const CardContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  padding: '20px',
  width: '100%',
  boxSizing: 'border-box',
  maxWidth: '1200px',
  margin: '0 auto',
});

const Section = styled('div')({
  marginBottom: '40px',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
});

const SectionTitle = styled('h2')({
  textAlign: 'left',
  padding: '0 20px',
});

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
});

const SearchFilterContainer = styled(Box)({
  display: 'flex',
  marginBottom: '40px',
  alignItems: 'center',
  position: 'relative',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  '& .MuiButton-root': {
    height: '56px',
    backgroundColor: '#E4E4E4',
    border: 'none',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '20px',
    padding: '8px 24px',
    position: 'absolute',
    right: '20px',
    '&:hover': {
      backgroundColor: '#D0D0D0',
    },
  },
});

const FilterPanelContainer = styled(Box)({
  marginBottom: '40px',
  backgroundColor: '#E4E4E4',
  borderRadius: '20px',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  padding: '16px',
});

const initialBookingFormState: BookingFormState = {
  // Audience Information
  gradeLevels: [],
  subjects: [],
  estimatedStudents: 0,

  // Event Details
  eventName: '',
  eventPurpose: '',
  dateTime: '',
  timezone: 'America/New_York', // Default timezone
  isInPerson: false,
  isVirtual: false,
  additionalInfo: '',

  // Speaker Preferences
  expertise: '',
  preferredLanguage: '',
  city: '',
  state: '',
  country: '',
  goals: '',
  budget: '',
  engagementFormat: '',
};

// Common timezones
const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

// Add language options at the top of the file
const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];

// Add a helper function to safely get speaker name
const getSpeakerName = (speaker: Speaker): string => {
  try {
    if (speaker?.userId?.firstName && speaker?.userId?.lastName) {
      return `${speaker.userId.firstName} ${speaker.userId.lastName}`;
    }
    return 'Unnamed Speaker';
  } catch (error) {
    console.error('Error getting speaker name:', speaker, error);
    return 'Unnamed Speaker';
  }
};

// Add a helper function to safely get speaker email
const getSpeakerEmail = (speaker: Speaker): string => {
  try {
    return speaker?.userId?.email || 'No email provided';
  } catch (error) {
    console.error('Error getting speaker email:', speaker, error);
    return 'No email provided';
  }
};

function TeacherSearchSpeakerPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    industry: [],
    grades: [],
    city: '',
    state: '',
    country: '',
    formats: {
      inperson: false,
      virtual: false,
    },
    languages: [],
    userCoordinates: undefined,
  });
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(
    initialBookingFormState,
  );

  // Load speakers from backend
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await getData('speaker/all');
        if (response.error) {
          throw new Error(response.error.message);
        }
        console.log('Fetched speakers:', response.data);
        
        // Validate speaker data structure
        if (Array.isArray(response.data)) {
          response.data.forEach((speaker, index) => {
            console.log(`Speaker ${index}:`, speaker);
            if (!speaker.userId) {
              console.warn(`Speaker ${index} missing userId:`, speaker);
            }
          });
        }
        
        setSpeakers(response.data);
        setFilteredSpeakers(response.data);
      } catch (error) {
        setError(
          'Failed to fetch speakers: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        );
      }
    };
    fetchSpeakers();
  }, []);

  // Update handleSearch to use safe name access
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    console.log('Current speakers:', speakers);
    setSearchQuery(query);
    applyFiltersAndSearch(speakers, query, filters);
  };

  const handleCardClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowBookingForm(false);
  };

  const handleFilterPanelToggle = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  // Combined function to apply both search and filters
  const applyFiltersAndSearch = (speakersToFilter: Speaker[], currentSearchQuery: string, currentFilters: FilterState) => {
    console.log('applyFiltersAndSearch called with:', { speakersToFilter, currentSearchQuery, currentFilters });
    let result = [...speakersToFilter];

    // Apply search query
    if (currentSearchQuery.trim()) {
      const lowercaseQuery = currentSearchQuery.toLowerCase();
      result = result.filter((speaker) => {
        try {
          const fullName = getSpeakerName(speaker).toLowerCase();
          const locationDisplay = [speaker.city, speaker.state, speaker.country].filter(Boolean).join(', ').toLowerCase();
          const organization = (speaker.organization || '').toLowerCase();
          const bio = (speaker.bio || '').toLowerCase();
          
          return (
            fullName.includes(lowercaseQuery) ||
            organization.includes(lowercaseQuery) ||
            bio.includes(lowercaseQuery) ||
            locationDisplay.includes(lowercaseQuery)
          );
        } catch (error) {
          console.error('Error filtering speaker:', speaker, error);
          return false;
        }
      });
    }

    // Apply industry filter
    if (currentFilters.industry && currentFilters.industry.length > 0) {
      result = result.filter(
        (speaker) =>
          speaker.industry &&
          currentFilters.industry.some((industry) =>
            speaker.industry.includes(industry),
          ),
      );
    }

    // Apply grade level filter
    if (currentFilters.grades && currentFilters.grades.length > 0) {
      result = result.filter(
        (speaker) =>
          speaker.grades &&
          currentFilters.grades.some((grade) => speaker.grades.includes(grade)),
      );
    }

    // Apply location filter
    if (currentFilters.city && currentFilters.city.trim() !== '') {
      result = result.filter(
        (speaker) =>
          speaker.city &&
          speaker.city.toLowerCase() === currentFilters.city.toLowerCase(),
      );
    }

    if (currentFilters.state && currentFilters.state.trim() !== '') {
      result = result.filter(
        (speaker) =>
          speaker.state &&
          speaker.state.toLowerCase() === currentFilters.state.toLowerCase(),
      );
    }

    if (currentFilters.country && currentFilters.country.trim() !== '') {
      result = result.filter(
        (speaker) =>
          speaker.country &&
          speaker.country.toLowerCase() === currentFilters.country.toLowerCase(),
      );
    }

    // Apply format filter
    if (currentFilters.formats) {
      if (currentFilters.formats.inperson && !currentFilters.formats.virtual) {
        result = result.filter((speaker) => speaker.inperson === true);
      } else if (!currentFilters.formats.inperson && currentFilters.formats.virtual) {
        result = result.filter((speaker) => speaker.virtual === true);
      } else if (currentFilters.formats.inperson && currentFilters.formats.virtual) {
        result = result.filter(
          (speaker) => speaker.inperson === true || speaker.virtual === true,
        );
      }
    }

    // Apply language filter
    if (currentFilters.languages && currentFilters.languages.length > 0) {
      result = result.filter(
        (speaker) =>
          speaker.languages &&
          currentFilters.languages.some((language) =>
            speaker.languages.includes(language),
          ),
      );
    }

    setFilteredSpeakers(result);
  };

  // Update handleFilterChange to work with search
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);
    // Apply both current search query and new filters
    applyFiltersAndSearch(speakers, searchQuery, newFilters);
  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setBookingForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleBookSpeaker = () => {
    setShowBookingForm((prev) => !prev);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpeaker) {
      setError('No speaker selected');
      return;
    }

    // Validate required fields
    if (
      !bookingForm.gradeLevels.length ||
      !bookingForm.subjects.length ||
      !bookingForm.estimatedStudents ||
      !bookingForm.eventName ||
      !bookingForm.eventPurpose ||
      !bookingForm.dateTime ||
      !bookingForm.expertise ||
      !bookingForm.preferredLanguage ||
      !bookingForm.city ||
      !bookingForm.state ||
      !bookingForm.goals ||
      !bookingForm.engagementFormat
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (!bookingForm.isInPerson && !bookingForm.isVirtual) {
      setError('Please select at least one format (In-person or Virtual)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestData = {
        // Audience Information
        gradeLevels: bookingForm.gradeLevels,
        subjects: bookingForm.subjects,
        estimatedStudents: bookingForm.estimatedStudents,

        // Event Details
        eventName: bookingForm.eventName,
        eventPurpose: bookingForm.eventPurpose,
        dateTime: bookingForm.dateTime,
        timezone: bookingForm.timezone,
        isInPerson: bookingForm.isInPerson,
        isVirtual: bookingForm.isVirtual,
        additionalInfo: bookingForm.additionalInfo,

        // Speaker Preferences
        expertise: bookingForm.expertise,
        preferredLanguage: bookingForm.preferredLanguage,
        city: bookingForm.city,
        state: bookingForm.state,
        country: bookingForm.country,
        goals: bookingForm.goals,
        budget: bookingForm.budget,
        engagementFormat: bookingForm.engagementFormat,
      };

      await createTeacherRequest(selectedSpeaker._id, requestData);

      setSuccess('Speaker request submitted successfully!');
      setShowBookingForm(false);
      setBookingForm(initialBookingFormState);
      setOpen(false);
    } catch (err) {
      setError(
        'Failed to submit request: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setBookingForm(initialBookingFormState);
    setError(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const formatDateTime = (dateTime: string, timezone: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: timezone,
    });
  };

  return (
    <div className="flex-div">
      <TopBar />
      <Sidebar />
      <div className="main-window">
        <div className="request-stack">
          <Section>
            <SectionTitle>Available Speakers</SectionTitle>

            <SearchFilterContainer>
              <Box sx={{ width: '100%' }}>
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search speakers..."
                  onFilterClick={handleFilterPanelToggle}
                />
              </Box>
            </SearchFilterContainer>

            <Collapse in={filterPanelOpen}>
              <FilterPanelContainer>
                <SpeakerFilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                />
              </FilterPanelContainer>
            </Collapse>

            <CardContainer>
              {filteredSpeakers.length > 0 ? (
                filteredSpeakers.map((speaker) => (
                  <div
                    key={speaker._id}
                    onClick={() => handleCardClick(speaker)}
                    style={{ cursor: 'pointer', width: '100%' }}
                  >
                    <SpeakerCard
                      id={speaker._id}
                      name={getSpeakerName(speaker)}
                      bio={speaker.bio || 'No bio provided'}
                      organization={
                        speaker.organization || 'No organization provided'
                      }
                      city={speaker.city}
                      state={speaker.state}
                      country={speaker.country}
                      imageUrl={speaker.imageUrl}
                    />
                  </div>
                ))
              ) : (
                <Typography variant="body1" sx={{ p: 2 }}>
                  No speakers match the current filters. Try adjusting your
                  search or filters.
                </Typography>
              )}
            </CardContainer>
          </Section>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: '90%',
            maxWidth: showBookingForm ? '1200px' : '800px',
            overflow: 'hidden',
          },
        }}
      >
        {selectedSpeaker && (
          <>
            <StyledDialogTitle>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {getSpeakerName(selectedSpeaker)}
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color={showBookingForm ? 'secondary' : 'primary'}
                  onClick={handleBookSpeaker}
                  startIcon={<EventIcon />}
                  sx={{ mr: 1 }}
                >
                  {showBookingForm ? 'Close Form' : 'Book Speaker'}
                </Button>
                <IconButton onClick={handleClose} size="large">
                  <CloseIcon />
                </IconButton>
              </Box>
            </StyledDialogTitle>
            <DialogContent>
              {showBookingForm ? (
                // Booking Form
                <Box
                  component="form"
                  onSubmit={handleBookingSubmit}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Request Booking for {getSpeakerName(selectedSpeaker)}
                  </Typography>

                  {/* Audience Section */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '2px solid #3498db',
                      pb: 1,
                    }}
                  >
                    Audience Information
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Grade Level(s)</InputLabel>
                        <Select
                          multiple
                          name="gradeLevels"
                          value={bookingForm.gradeLevels}
                          onChange={(e) => {
                            const value =
                              typeof e.target.value === 'string'
                                ? [e.target.value]
                                : e.target.value;
                            setBookingForm((prev) => ({
                              ...prev,
                              gradeLevels: value,
                            }));
                          }}
                          label="Grade Level(s)"
                        >
                          <MenuItem value="Elementary">Elementary</MenuItem>
                          <MenuItem value="Middle School">
                            Middle School
                          </MenuItem>
                          <MenuItem value="High School">High School</MenuItem>
                          <MenuItem value="K-5">K-5</MenuItem>
                          <MenuItem value="6-8">6-8</MenuItem>
                          <MenuItem value="9-12">9-12</MenuItem>
                          <MenuItem value="K-12">K-12</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Subject(s)"
                        name="subjects"
                        value={bookingForm.subjects[0] || ''}
                        onChange={(e) => {
                          setBookingForm((prev) => ({ ...prev, subjects: [e.target.value] }));
                        }}
                        helperText="Separate multiple subjects with commas"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        type="number"
                        label="Estimated Number of Students"
                        name="estimatedStudents"
                        value={bookingForm.estimatedStudents}
                        onChange={handleBookingFormChange}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>

                  {/* Event Details Section */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '2px solid #3498db',
                      pb: 1,
                    }}
                  >
                    Event Details
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Event Name"
                        name="eventName"
                        value={bookingForm.eventName}
                        onChange={handleBookingFormChange}
                        helperText="What is this event or session called?"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Event Purpose"
                        name="eventPurpose"
                        value={bookingForm.eventPurpose}
                        onChange={handleBookingFormChange}
                        helperText="What's the goal or theme?"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        type="datetime-local"
                        label="Proposed Date/Time"
                        name="dateTime"
                        value={bookingForm.dateTime}
                        onChange={handleBookingFormChange}
                        InputLabelProps={{ shrink: true }}
                        helperText="Include ideal date and time (plus time zone). If flexible, note options."
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          name="timezone"
                          value={bookingForm.timezone}
                          onChange={handleSelectChange}
                          label="Timezone"
                        >
                          {timezones.map((tz) => (
                            <MenuItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Additional Information Field */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        sx={{ mt: 2, mb: 1, fontWeight: 500 }}
                      >
                        Other Scheduling Considerations (optional)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        label="Additional Information"
                        name="additionalInfo"
                        value={bookingForm.additionalInfo || ''}
                        onChange={handleBookingFormChange}
                        placeholder="Share any other details, constraints, or requests for scheduling."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset" required>
                        <FormLabel component="legend">Event Format</FormLabel>
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bookingForm.isInPerson}
                                onChange={handleCheckboxChange}
                                name="isInPerson"
                              />
                            }
                            label="In-person"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bookingForm.isVirtual}
                                onChange={handleCheckboxChange}
                                name="isVirtual"
                              />
                            }
                            label="Virtual"
                          />
                        </FormGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Speaker Preferences Section */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '2px solid #3498db',
                      pb: 1,
                    }}
                  >
                    Speaker Preferences
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Area of Expertise Requested"
                        name="expertise"
                        value={bookingForm.expertise}
                        onChange={handleBookingFormChange}
                        helperText="What topic(s) would you like the speaker to focus on? (e.g. food systems, clean energy, sustainable fashion)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Preferred Language</InputLabel>
                        <Select
                          name="preferredLanguage"
                          value={bookingForm.preferredLanguage}
                          label="Preferred Language"
                          onChange={handleSelectChange}
                        >
                          {languageOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="City"
                        name="city"
                        value={bookingForm.city}
                        onChange={handleBookingFormChange}
                        helperText="City where the event will take place"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={bookingForm.state}
                        onChange={handleBookingFormChange}
                        helperText="State (if applicable)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={bookingForm.country}
                        onChange={handleBookingFormChange}
                        helperText="Country (if applicable)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Budget"
                        name="budget"
                        value={bookingForm.budget}
                        onChange={handleBookingFormChange}
                        placeholder="e.g., $500-1000"
                        helperText="If you have a budget to offer a speaker honorarium or travel reimbursement, please include details."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={3}
                        label="Goals / Notes"
                        name="goals"
                        value={bookingForm.goals}
                        onChange={handleBookingFormChange}
                        helperText="What do you hope students gain from this experience? Feel free to share curriculum connections, relevant projects, or speaker guidance."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={2}
                        label="Engagement Format"
                        name="engagementFormat"
                        value={bookingForm.engagementFormat}
                        onChange={handleBookingFormChange}
                        placeholder="e.g., 30-min talk with Q&A, panel, presentation with slides, interactive workshop"
                        helperText="How do you envision the session running?"
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCloseBookingForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      startIcon={
                        submitting ? <CircularProgress size={20} /> : null
                      }
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                // Speaker Details
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={selectedSpeaker.imageUrl || DEFAULT_IMAGE}
                    alt={getSpeakerName(selectedSpeaker)}
                    sx={{
                      width: { xs: '100%', md: '40%' },
                      height: 'auto',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      maxHeight: '400px',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_IMAGE;
                      target.onerror = null;
                    }}
                  />
                  <Box sx={{ width: { xs: '100%', md: '60%' } }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: '#3498db', fontWeight: 600 }}
                    >
                      {selectedSpeaker.organization ||
                        'No organization provided'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                      <Typography variant="body1">
                        {getSpeakerEmail(selectedSpeaker)}
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      {[selectedSpeaker.city, selectedSpeaker.state, selectedSpeaker.country].filter(Boolean).join(', ') || 'No location provided'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      {selectedSpeaker.inperson && (
                        <Chip
                          icon={<PersonIcon />}
                          label="In-person"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {selectedSpeaker.virtual && (
                        <Chip
                          icon={<VideocamIcon />}
                          label="Virtual"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                    >
                      About
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedSpeaker.bio || 'No bio provided'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

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

export default TeacherSearchSpeakerPage;
