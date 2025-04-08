import React, { useState } from 'react';
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
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  Slide,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import { SelectChangeEvent } from '@mui/material';

interface Speaker {
  id: string;
  name: string;
  bio: string;
  organization: string;
  location: string;
  imageUrl: string;
  email: string;
  inperson: boolean;
  virtual: boolean;
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
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
  },
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

// Styled components
const CardContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  justifyContent: 'flex-start',
});

const Section = styled('div')({
  marginBottom: '40px',
});

const SectionTitle = styled('h2')({
  textAlign: 'left',
});

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
});

function TeacherSearchSpeakerPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [open, setOpen] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormState, setBookingFormState] = useState<BookingFormState>(initialBookingFormState);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  const handleCardClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBookingFormState((prev: BookingFormState) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setBookingFormState((prev: BookingFormState) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking submission logic
    console.log('Booking form submitted:', bookingFormState);
  };

  const handleBookSpeaker = () => {
    setShowBookingForm(prev => !prev);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setBookingFormState(initialBookingFormState);
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
            <SearchBar
              onSearch={handleSearch}
              placeholder="Type your search..."
            />
            <CardContainer>
              {speakers.length > 0 ? (
                speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    onClick={() => handleCardClick(speaker)}
                    style={{ cursor: 'pointer' }}
                  >
                    <SpeakerCard
                      id={speaker.id}
                      name={speaker.name}
                      bio={speaker.bio}
                      organization={speaker.organization}
                      location={speaker.location}
                      imageUrl={speaker.imageUrl}
                    />
                  </div>
                ))
              ) : (
                <p>No speakers found</p>
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
                      {selectedSpeaker.organization}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                      <Typography variant="body1">
                        {selectedSpeaker.email}
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      {selectedSpeaker.location}
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
                      value={bookingFormState.eventName}
                      onChange={handleBookingFormChange}
                      required
                      helperText="What is this event or session called?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Event Purpose"
                      name="eventPurpose"
                      value={bookingFormState.eventPurpose}
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
                          value={bookingFormState.dateTime}
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
                            value={bookingFormState.timezone}
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
                            checked={bookingFormState.isInPerson}
                            onChange={handleBookingFormChange}
                            name="isInPerson"
                          />
                        }
                        label="In-person"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookingFormState.isVirtual}
                            onChange={handleBookingFormChange}
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
                      value={bookingFormState.expertise}
                      onChange={handleBookingFormChange}
                      required
                      helperText="What topic(s) would you like the speaker to focus on? (e.g. food systems, clean energy, sustainable fashion)"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Preferred Language"
                      name="preferredLanguage"
                      value={bookingFormState.preferredLanguage}
                      onChange={handleBookingFormChange}
                      helperText="What language would you prefer the speaker to use?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={bookingFormState.location}
                      onChange={handleBookingFormChange}
                      required
                      helperText="Where will this event take place (or be hosted virtually)?"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Goals / Notes"
                      name="goals"
                      value={bookingFormState.goals}
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
                      value={bookingFormState.budget}
                      onChange={handleBookingFormChange}
                      helperText="If you have a budget to offer a speaker honorarium or travel reimbursement, please include details."
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Engagement Format"
                      name="engagementFormat"
                      value={bookingFormState.engagementFormat}
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
