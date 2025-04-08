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
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import SpeakerRequestCard from '../components/cards/SpeakerRequestCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import SearchBar from '../components/search_bar/SearchBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, { FilterState } from '../components/SpeakerFilterPanel';

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

interface Request {
  id: string;
  speaker: Speaker;
  status: string;
  date?: string;
  notes?: string;
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

const SearchFilterContainer = styled(Box)({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'center',
  '& .MuiButton-root': {
    height: '56px',
    backgroundColor: '#E4E4E4',
    border: 'none',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '20px',
    padding: '8px 24px',
    '&:hover': {
      backgroundColor: '#D0D0D0',
    },
  },
});

const FilterPanelContainer = styled(Box)({
  marginBottom: '24px',
  backgroundColor: '#E4E4E4',
  borderRadius: '20px',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  padding: '16px',
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
  { 
    id: 'speaker1', 
    name: 'Edward', 
    bio: 'Expert in environmental education',
    organization: 'Environmental Education Center',
    location: 'New York, NY',
    email: 'edward@xxx.org',
    inperson: true,
    virtual: false,
    imageUrl: 'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
    industry: ['Environmental', 'Education'],
    grades: ['Elementary', 'Middle School'],
    city: 'New York',
    state: 'NY',
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    },
    languages: ['English', 'Mandarin']
  },
  { 
    id: 'speaker2', 
    name: 'Khoi', 
    bio: 'Climate change researcher',
    organization: 'Climate Research Institute',
    location: 'Boston, MA',
    email: 'khoi@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    industry: ['Environment', 'Science', 'Technology'],
    grades: ['High School'],
    city: 'Boston',
    state: 'MA',
    coordinates: {
      lat: 42.3601,
      lng: -71.0589
    },
    languages: ['English', 'Vietnamese']
  },
  { 
    id: 'speaker3', 
    name: 'Evelyn', 
    bio: 'Sustainability consultant',
    organization: 'Sustainability Foundation',
    location: 'San Francisco, CA',
    email: 'evelyn@xxx.org',
    inperson: false,
    virtual: true,
    imageUrl: 'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
    industry: ['Business', 'Sustainability'],
    grades: ['Middle School', 'High School'],
    city: 'San Francisco',
    state: 'CA',
    coordinates: {
      lat: 37.7749,
      lng: -122.4194
    },
    languages: ['English', 'Spanish']
  },
  { 
    id: 'speaker4', 
    name: 'Yeon', 
    bio: 'Marine biology specialist',
    organization: 'Marine Biology Lab',
    location: 'Seattle, WA',
    email: 'yeon@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    industry: ['Science', 'Environment'],
    grades: ['Elementary', 'Middle School', 'High School'],
    city: 'Seattle',
    state: 'WA',
    coordinates: {
      lat: 47.6062,
      lng: -122.3321
    },
    languages: ['English', 'Korean']
  }
];

const requests = [
  { 
    id: '1', 
    speaker: speakers[0], 
    status: 'upcoming',
    date: '2024-04-15',
    notes: 'Request for environmental education workshop'
  },
  { 
    id: '2', 
    speaker: speakers[1], 
    status: 'pending',
    date: '2024-04-20',
    notes: 'Request for technology presentation'
  },
  { 
    id: '3', 
    speaker: speakers[2], 
    status: 'archived',
    date: '2024-03-15',
    notes: 'Completed research seminar'
  },
  { 
    id: '4', 
    speaker: speakers[3], 
    status: 'upcoming',
    date: '2024-04-25',
    notes: 'Request for marine biology lecture'
  }
];

function TeacherRequestSpeakerPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [open, setOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    industry: [],
    grades: [],
    city: '',
    state: '',
    radius: 50,
    formats: {
      inperson: false,
      virtual: false,
    },
    languages: [],
  });

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

  // Group and filter requests
  const getFilteredRequests = () => {
    let result = [...requests];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(request => {
        const speaker = request.speaker;
        return (
          speaker.name.toLowerCase().includes(query) ||
          (speaker.organization && speaker.organization.toLowerCase().includes(query)) ||
          speaker.bio.toLowerCase().includes(query) ||
          (speaker.location && speaker.location.toLowerCase().includes(query)) ||
          (request.notes && request.notes.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      result = result.filter(request => 
        request.speaker.industry && 
        filters.industry.some(industry => 
          request.speaker.industry?.includes(industry)
        )
      );
    }
    
    // Apply grade level filter
    if (filters.grades && filters.grades.length > 0) {
      result = result.filter(request => 
        request.speaker.grades && 
        filters.grades.some(grade => 
          request.speaker.grades?.includes(grade)
        )
      );
    }
    
    // Apply location filter
    if (filters.city && filters.city.trim() !== '') {
      result = result.filter(request => 
        request.speaker.city && 
        request.speaker.city.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    if (filters.state && filters.state.trim() !== '') {
      result = result.filter(request => 
        request.speaker.state && 
        request.speaker.state.toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    // Apply radius filter if coordinates are available
    if (filters.radius && filters.radius > 0 && filters.userCoordinates) {
      const { lat: userLat, lng: userLng } = filters.userCoordinates;
      
      result = result.filter(request => {
        if (!request.speaker.coordinates) return true;
        const distance = calculateDistance(
          userLat, 
          userLng, 
          request.speaker.coordinates.lat, 
          request.speaker.coordinates.lng
        );
        return distance <= filters.radius;
      });
    }
    
    // Apply format filter
    if (filters.formats) {
      // If both formats are unchecked, show all requests
      if (!filters.formats.inperson && !filters.formats.virtual) {
        // No filtering needed
      } else {
        result = result.filter(request => {
          const speaker = request.speaker;
          if (filters.formats.inperson && !filters.formats.virtual) {
            return speaker.inperson === true;
          } else if (!filters.formats.inperson && filters.formats.virtual) {
            return speaker.virtual === true;
          } else if (filters.formats.inperson && filters.formats.virtual) {
            return speaker.inperson === true || speaker.virtual === true;
          }
          return true;
        });
      }
    }
    
    // Apply language filter
    if (filters.languages && filters.languages.length > 0) {
      result = result.filter(request => 
        request.speaker.languages && 
        filters.languages.some(language => 
          request.speaker.languages?.includes(language)
        )
      );
    }
    
    return result;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCardClick = (speaker: Speaker) => {
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

  const handleFilterPanelToggle = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);
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

  // Group filtered requests by status
  const groupedRequests = getFilteredRequests().reduce((acc, request) => {
    const status = request.status.toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {} as { [key: string]: Request[] });

  // Define the order of status sections
  const statusOrder = ['upcoming', 'pending', 'archived'];

  return (
    <div className="flex-div">
      <TopBar />
      <Sidebar />
      <div className="main-window">
        <div className="request-stack">
          <SearchFilterContainer>
            <Box sx={{ flexGrow: 1 }}>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search requests..."
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilterPanelToggle}
              sx={{
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                color: '#49454F',
              }}
            >
              Filters
            </Button>
          </SearchFilterContainer>

          <Collapse in={filterPanelOpen}>
            <FilterPanelContainer>
              <SpeakerFilterPanel
                filters={filters}
                onChange={handleFilterChange}
              />
            </FilterPanelContainer>
          </Collapse>

          {Object.keys(groupedRequests).length > 0 ? (
            statusOrder.map((status) => {
              if (groupedRequests[status] && groupedRequests[status].length > 0) {
                return (
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
                );
              }
              return null;
            })
          ) : (
            <Typography variant="body1" sx={{ p: 2 }}>
              No requests match the current filters. Try adjusting your search or filters.
            </Typography>
          )}
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
