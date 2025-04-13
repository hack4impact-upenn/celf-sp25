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
import SpeakerFilterPanel, { FilterState } from '../components/SpeakerFilterPanel';
import { SelectChangeEvent } from '@mui/material';

interface Speaker {
  id: string;
  name: string;
  bio: string;
  organization?: string;
  location?: string;
  email?: string;
  inperson?: boolean;
  virtual?: boolean;
  imageUrl?: string;
  industry?: string[];
  grades?: string[];
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages?: string[];
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
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '16px 20px',
});

// TODO: REMOVE THIS TEST DATA
const speakers = [
  {
    id: '1',
    name: 'David Vexler',
    bio: 'PER biggest fan',
    organization: 'Buffalo State University',
    location: 'Buffalo, NY',
    email: 'david@buffalo.com',
    inperson: true,
    virtual: false,
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
  },
  {
    id: '2',
    name: 'Khoi',
    bio: 'hi pmtls',
    organization: 'XXX Foundation',
    location: 'Virginia, VA',
    email: 'khoi@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
  },
  {
    id: '3',
    name: 'Edward',
    bio: 'hello pmtls',
    organization: 'YYY Foundation',
    location: 'Hong Kong, Hong Kong',
    email: 'edward@yyy.org',
    inperson: false,
    virtual: true,
    imageUrl: 'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
    industry: ['Research', 'Technology'],
    grades: ['Elementary', 'Middle School'],
    city: 'Hong Kong',
    state: 'Hong Kong',
    coordinates: {
      lat: 22.3193,
      lng: 114.1694
    },
    languages: ['English', 'Cantonese', 'Mandarin']
  }
];

const initialBookingFormState: BookingFormState = {
  eventName: '',
  eventPurpose: '',
  dateTime: '',
  timezone: 'America/New_York', // Default timezone
  isInPerson: false,
  isVirtual: false,
  expertise: '',
  preferredLanguage: '',
  location: '',
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
    radius: 50,
    formats: {
      inperson: false,
      virtual: false
    },
    languages: [],
    userCoordinates: undefined
  });
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingFormState);

  // Add filtered speakers state
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>(speakers);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Update handleSearch to filter speakers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSpeakers(speakers);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const results = speakers.filter(speaker => {
      // Search in basic fields
      const basicMatch = 
        speaker.name.toLowerCase().includes(lowercaseQuery) ||
        (speaker.organization && speaker.organization.toLowerCase().includes(lowercaseQuery)) ||
        speaker.bio.toLowerCase().includes(lowercaseQuery) ||
        (speaker.location && speaker.location.toLowerCase().includes(lowercaseQuery)) ||
        (speaker.email && speaker.email.toLowerCase().includes(lowercaseQuery));

      // Search in arrays
      const industryMatch = speaker.industry?.some(industry => 
        industry.toLowerCase().includes(lowercaseQuery)
      );
      const gradesMatch = speaker.grades?.some(grade => 
        grade.toLowerCase().includes(lowercaseQuery)
      );
      const languagesMatch = speaker.languages?.some(language => 
        language.toLowerCase().includes(lowercaseQuery)
      );

      // Search in location fields
      const locationMatch = 
        (speaker.city && speaker.city.toLowerCase().includes(lowercaseQuery)) ||
        (speaker.state && speaker.state.toLowerCase().includes(lowercaseQuery));

      return basicMatch || industryMatch || gradesMatch || languagesMatch || locationMatch;
    });
    
    setFilteredSpeakers(results);
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

  // Update handleFilterChange to filter speakers
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);

    let result = [...speakers];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(speaker => {
        return (
          speaker.name.toLowerCase().includes(query) ||
          (speaker.organization && speaker.organization.toLowerCase().includes(query)) ||
          speaker.bio.toLowerCase().includes(query) ||
          (speaker.location && speaker.location.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply industry filter
    if (newFilters.industry && newFilters.industry.length > 0) {
      result = result.filter(speaker => 
        speaker.industry && 
        newFilters.industry.some(industry => 
          speaker.industry?.includes(industry)
        )
      );
    }
    
    // Apply grade level filter
    if (newFilters.grades && newFilters.grades.length > 0) {
      result = result.filter(speaker => 
        speaker.grades && 
        newFilters.grades.some(grade => 
          speaker.grades?.includes(grade)
        )
      );
    }
    
    // Apply location filter
    if (newFilters.city && newFilters.city.trim() !== '') {
      result = result.filter(speaker => 
        speaker.city && 
        speaker.city.toLowerCase() === newFilters.city.toLowerCase()
      );
    }
    
    if (newFilters.state && newFilters.state.trim() !== '') {
      result = result.filter(speaker => 
        speaker.state && 
        speaker.state.toLowerCase() === newFilters.state.toLowerCase()
      );
    }
    
    // Apply radius filter if coordinates are available
    if (newFilters.radius && newFilters.radius > 0 && newFilters.userCoordinates) {
      const { lat: userLat, lng: userLng } = newFilters.userCoordinates;
      
      result = result.filter(speaker => {
        if (!speaker.coordinates) return true;
        const distance = calculateDistance(
          userLat, 
          userLng, 
          speaker.coordinates.lat, 
          speaker.coordinates.lng
        );
        return distance <= newFilters.radius;
      });
    }
    
    // Apply format filter
    if (newFilters.formats) {
      if (newFilters.formats.inperson && !newFilters.formats.virtual) {
        result = result.filter(speaker => speaker.inperson === true);
      } else if (!newFilters.formats.inperson && newFilters.formats.virtual) {
        result = result.filter(speaker => speaker.virtual === true);
      } else if (newFilters.formats.inperson && newFilters.formats.virtual) {
        result = result.filter(speaker => speaker.inperson === true || speaker.virtual === true);
      }
    }
    
    // Apply language filter
    if (newFilters.languages && newFilters.languages.length > 0) {
      result = result.filter(speaker => 
        speaker.languages && 
        newFilters.languages.some(language => 
          speaker.languages?.includes(language)
        )
      );
    }
    
    setFilteredSpeakers(result);
  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setBookingForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleBookSpeaker = () => {
    setShowBookingForm(prev => !prev);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking submission logic
    console.log('Booking form submitted:', bookingForm);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setBookingForm(initialBookingFormState);
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
      timeZone: timezone
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
                    key={speaker.id}
                    onClick={() => handleCardClick(speaker)}
                    style={{ cursor: 'pointer', width: '100%' }}
                  >
                    <SpeakerCard
                      id={speaker.id}
                      name={speaker.name}
                      bio={speaker.bio}
                      organization={speaker.organization || ''}
                      location={speaker.location || ''}
                      imageUrl={speaker.imageUrl}
                    />
                  </div>
                ))
              ) : (
                <Typography variant="body1" sx={{ p: 2, gridColumn: '1 / -1' }}>
                  No speakers match the current filters. Try adjusting your search or filters.
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
                {selectedSpeaker.name}
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color={showBookingForm ? "secondary" : "primary"}
                  onClick={handleBookSpeaker}
                  startIcon={<EventIcon />}
                  sx={{ mr: 1 }}
                >
                  {showBookingForm ? "Close Form" : "Book Speaker"}
                </Button>
                <IconButton onClick={handleClose} size="large">
                  <CloseIcon />
                </IconButton>
              </Box>
            </StyledDialogTitle>
            <DialogContent sx={{ display: 'flex', p: 0 }}>
              <Box
                sx={{
                  width: showBookingForm ? '50%' : '100%',
                  p: 3,
                  transition: 'width 0.3s ease-in-out',
                }}
              >
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
                    alt={selectedSpeaker.name}
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
                      {selectedSpeaker.organization || selectedSpeaker.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                      <Typography variant="body1">
                        {selectedSpeaker.email || ''}
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      {selectedSpeaker.city}, {selectedSpeaker.state}
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
                      {selectedSpeaker.bio}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Slide direction="left" in={showBookingForm} mountOnEnter unmountOnExit>
                <Paper
                  elevation={0}
                  sx={{
                    width: '50%',
                    p: 3,
                    pb: 6,
                    borderLeft: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box component="form" onSubmit={handleBookingSubmit} sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Book Speaker
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <TextField
                      fullWidth
                      label="Event Name"
                      name="eventName"
                      value={bookingForm.eventName}
                      onChange={handleBookingFormChange}
                      required
                      helperText="What is this event or session called?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Event Purpose"
                      name="eventPurpose"
                      value={bookingForm.eventPurpose}
                      onChange={handleBookingFormChange}
                      required
                      multiline
                      rows={2}
                      helperText="What's the goal or theme of the event?"
                      sx={{ mb: 2 }}
                    />
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          label="Proposed Date/Time"
                          name="dateTime"
                          value={bookingForm.dateTime}
                          onChange={handleBookingFormChange}
                          required
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          helperText="Include ideal date and time"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl fullWidth>
                          <InputLabel>Time Zone</InputLabel>
                          <Select
                            value={bookingForm.timezone}
                            onChange={handleSelectChange}
                            name="timezone"
                            label="Time Zone"
                          >
                            {timezones.map((tz) => (
                              <MenuItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    <FormGroup sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Event Format*
                      </Typography>
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
                    
                    <TextField
                      fullWidth
                      label="Area of Expertise Requested"
                      name="expertise"
                      value={bookingForm.expertise}
                      onChange={handleBookingFormChange}
                      required
                      helperText="What topic(s) would you like the speaker to focus on? (e.g. food systems, clean energy, sustainable fashion)"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Preferred Language"
                      name="preferredLanguage"
                      value={bookingForm.preferredLanguage}
                      onChange={handleBookingFormChange}
                      helperText="What language would you prefer the speaker to use?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={bookingForm.location}
                      onChange={handleBookingFormChange}
                      required
                      helperText="Where will this event take place (or be hosted virtually)?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Goals / Notes"
                      name="goals"
                      value={bookingForm.goals}
                      onChange={handleBookingFormChange}
                      multiline
                      rows={3}
                      helperText="What do you hope students gain from this experience? Feel free to share curriculum connections, relevant projects, or speaker guidance."
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Budget"
                      name="budget"
                      value={bookingForm.budget}
                      onChange={handleBookingFormChange}
                      helperText="If you have a budget to offer a speaker honorarium or travel reimbursement, please include details."
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Engagement Format"
                      name="engagementFormat"
                      value={bookingForm.engagementFormat}
                      onChange={handleBookingFormChange}
                      required
                      multiline
                      rows={2}
                      helperText="How do you envision the session running? (e.g. 30-min talk with Q&A, panel, presentation with slides, interactive workshop)"
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: 1,
                      mt: 'auto',
                      pt: 2,
                    }}>
                      <Button onClick={handleCloseBookingForm} color="inherit">
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color="primary">
                        Submit Booking Request
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Slide>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default TeacherSearchSpeakerPage;
