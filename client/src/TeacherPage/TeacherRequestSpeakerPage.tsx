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
}

interface Request {
  id: string;
  speaker: Speaker;
  status: string;
}

interface DetailedSpeaker extends Speaker {
  organization: string;
  location: string;
  email: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl: string;
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
  },
  speaker2: {
    organization: 'Climate Research Institute',
    location: 'Boston, MA',
    email: 'khoi@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
  },
  speaker3: {
    organization: 'Sustainability Foundation',
    location: 'San Francisco, CA',
    email: 'evelyn@xxx.org',
    inperson: false,
    virtual: true,
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
  },
  speaker4: {
    organization: 'Marine Biology Lab',
    location: 'Seattle, WA',
    email: 'yeon@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  },
};

const speakers: Speaker[] = [
  { id: 'speaker1', name: 'Edward', bio: 'Expert in environmental education' },
  { id: 'speaker2', name: 'Khoi', bio: 'Climate change researcher' },
  { id: 'speaker3', name: 'Evelyn', bio: 'Sustainability consultant' },
  { id: 'speaker4', name: 'Yeon', bio: 'Marine biology specialist' },
];

const requests = [
  { id: '1', speaker: speakers[0], status: 'upcoming' },
  { id: '2', speaker: speakers[1], status: 'pending' },
  { id: '3', speaker: speakers[2], status: 'archived' },
  { id: '4', speaker: speakers[3], status: 'upcoming' },
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

  // Group requests by status
  const groupedRequests = requests.reduce((acc, request) => {
    const status = request.status.toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {} as { [key: string]: Request[] });

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
