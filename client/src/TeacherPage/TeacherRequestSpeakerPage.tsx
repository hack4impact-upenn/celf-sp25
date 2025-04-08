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
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import SpeakerRequestCard from '../components/cards/SpeakerRequestCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';

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
  bookingRequests?: BookingRequest[];
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
  teacherName: string;
  teacherEmail: string;
}

interface Request {
  id: string;
  speaker: Speaker;
  status: 'pending' | 'approved' | 'rejected' | 'upcoming' | 'archived';
}

interface DetailedSpeaker extends Speaker {
  organization: string;
  location: string;
  email: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl: string;
  bookingRequests?: BookingRequest[];
}

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

// Styled components for the dialog
const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
});

// Test data with detailed information for speakers
const speakersDetail: {
  [key: string]: Omit<DetailedSpeaker, 'id' | 'name' | 'bio'>;
} = {
  speaker1: {
    organization: 'Environmental Education Center',
    location: 'New York, NY',
    email: 'edward@xxx.org',
    inperson: true,
    virtual: false,
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
    bookingRequests: [
      {
        id: '1',
        eventName: 'Climate Change Workshop',
        eventPurpose: 'Educate students about climate change impacts',
        dateTime: '2024-04-15T14:00',
        timezone: 'America/New_York',
        isInPerson: true,
        isVirtual: false,
        expertise: 'Environmental Science',
        preferredLanguage: 'English',
        location: 'Room 101, Main Building',
        goals: 'Students will learn about climate change impacts and solutions',
        budget: '$500 honorarium',
        engagementFormat: '1-hour interactive workshop with Q&A',
        status: 'upcoming',
        teacherName: 'John Smith',
        teacherEmail: 'john@school.edu'
      }
    ]
  },
  speaker2: {
    organization: 'Climate Research Institute',
    location: 'Boston, MA',
    email: 'khoi@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    bookingRequests: [
      {
        id: '2',
        eventName: 'Sustainability Panel Discussion',
        eventPurpose: 'Discuss sustainable practices in urban environments',
        dateTime: '2024-05-20T10:00',
        timezone: 'America/New_York',
        isInPerson: false,
        isVirtual: true,
        expertise: 'Urban Sustainability',
        preferredLanguage: 'English',
        location: 'Virtual - Zoom',
        goals: 'Students will learn about sustainable urban development',
        budget: '$300 honorarium',
        engagementFormat: '45-min panel discussion with Q&A',
        status: 'pending',
        teacherName: 'Sarah Johnson',
        teacherEmail: 'sarah@school.edu'
      }
    ]
  },
  speaker3: {
    organization: 'Sustainability Foundation',
    location: 'San Francisco, CA',
    email: 'evelyn@xxx.org',
    inperson: false,
    virtual: true,
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
    bookingRequests: [
      {
        id: '3',
        eventName: 'Renewable Energy Talk',
        eventPurpose: 'Introduction to renewable energy technologies',
        dateTime: '2024-03-10T09:00',
        timezone: 'America/Los_Angeles',
        isInPerson: false,
        isVirtual: true,
        expertise: 'Renewable Energy',
        preferredLanguage: 'English',
        location: 'Virtual - Google Meet',
        goals: 'Students will understand different types of renewable energy',
        budget: '$400 honorarium',
        engagementFormat: '1-hour presentation with interactive elements',
        status: 'archived',
        teacherName: 'Michael Brown',
        teacherEmail: 'michael@school.edu'
      }
    ]
  },
  speaker4: {
    organization: 'Marine Biology Lab',
    location: 'Seattle, WA',
    email: 'yeon@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    bookingRequests: [
      {
        id: '4',
        eventName: 'Ocean Conservation Workshop',
        eventPurpose: 'Learn about marine conservation efforts',
        dateTime: '2024-06-05T13:00',
        timezone: 'America/Los_Angeles',
        isInPerson: true,
        isVirtual: true,
        expertise: 'Marine Biology',
        preferredLanguage: 'English',
        location: 'Science Center, Room 203',
        goals: 'Students will learn about marine ecosystems and conservation',
        budget: '$600 honorarium',
        engagementFormat: '2-hour workshop with hands-on activities',
        status: 'upcoming',
        teacherName: 'Emily Davis',
        teacherEmail: 'emily@school.edu'
      }
    ]
  },
};

const speakers: Speaker[] = [
  { id: 'speaker1', name: 'Edward', bio: 'Expert in environmental education' },
  { id: 'speaker2', name: 'Khoi', bio: 'Climate change researcher' },
  { id: 'speaker3', name: 'Evelyn', bio: 'Sustainability consultant' },
  { id: 'speaker4', name: 'Yeon', bio: 'Marine biology specialist' },
];

const requests: Request[] = [
  { id: '1', speaker: speakers[0], status: 'upcoming' as const },
  { id: '2', speaker: speakers[1], status: 'pending' as const },
  { id: '3', speaker: speakers[2], status: 'archived' as const },
  { id: '4', speaker: speakers[3], status: 'upcoming' as const },
];

function TeacherRequestSpeakerPage() {
  const [selectedSpeaker, setSelectedSpeaker] =
    useState<DetailedSpeaker | null>(null);
  const [open, setOpen] = useState(false);

  const handleCardClick = (speaker: Speaker) => {
    // Combine speaker basic info with detailed info
    const detailedInfo = speakersDetail[speaker.id];
    if (detailedInfo) {
      setSelectedSpeaker({
        ...speaker,
        ...detailedInfo,
      });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'Upcoming Sessions';
      case 'pending':
        return 'Pending Requests';
      case 'archived':
        return 'Archived Requests';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'upcoming':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Group requests by status
  const groupedRequests = requests.reduce((acc, request) => {
    const status = request.status.toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {} as { [key: string]: Request[] });

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
          {Object.keys(groupedRequests).map((status) => (
            <Section key={status}>
              <SectionTitle>{getStatusTitle(status)}</SectionTitle>
              <CardContainer>
                {groupedRequests[status].map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleCardClick(request.speaker)}
                    style={{ cursor: 'pointer' }}
                  >
                    <SpeakerRequestCard
                      id={request.id}
                      speakerid={request.speaker.id}
                      status={request.status}
                    />
                  </div>
                ))}
              </CardContainer>
            </Section>
          ))}
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
            maxWidth: '800px',
          },
        }}
      >
        {selectedSpeaker && (
          <>
            <StyledDialogTitle>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {selectedSpeaker.name}
              </Typography>
              <IconButton onClick={handleClose} size="large">
                <CloseIcon />
              </IconButton>
            </StyledDialogTitle>
            <DialogContent>
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

                  {selectedSpeaker.bookingRequests && selectedSpeaker.bookingRequests.length > 0 && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{ mt: 4, mb: 2, fontWeight: 600 }}
                      >
                        Booking Requests
                      </Typography>
                      {selectedSpeaker.bookingRequests.map((request) => (
                        <Paper
                          key={request.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {request.eventName}
                            </Typography>
                            <Chip
                              label={capitalizeFirstLetter(request.status)}
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {formatDateTime(request.dateTime, request.timezone)}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Purpose:</strong> {request.eventPurpose}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            {request.isInPerson && (
                              <Chip
                                icon={<PersonIcon />}
                                label="In-person"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {request.isVirtual && (
                              <Chip
                                icon={<VideocamIcon />}
                                label="Virtual"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Location:</strong> {request.location}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Expertise Requested:</strong> {request.expertise}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Preferred Language:</strong> {request.preferredLanguage}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Goals:</strong> {request.goals}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Budget:</strong> {request.budget}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Engagement Format:</strong> {request.engagementFormat}
                          </Typography>
                          
                          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                            <Typography variant="body2" color="text.secondary">
                              Requested by: {request.teacherName} ({request.teacherEmail})
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default TeacherRequestSpeakerPage;
