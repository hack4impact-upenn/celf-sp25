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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, { FilterState } from '../components/SpeakerFilterPanel';

interface Speaker {
  id: string;
  name: string;
  bio: string;
  organization: string;
  location: string;
  email: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl: string;
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
    imageUrl: 'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
    industry: ['Education', 'Research'],
    grades: ['High School', 'College'],
    city: 'Buffalo',
    state: 'NY',
    coordinates: {
      lat: 42.8864,
      lng: -78.8784
    },
    languages: ['English', 'Spanish']
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
    imageUrl: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    industry: ['Technology', 'Education'],
    grades: ['Middle School', 'High School'],
    city: 'Richmond',
    state: 'VA',
    coordinates: {
      lat: 37.5407,
      lng: -77.4360
    },
    languages: ['English', 'Vietnamese']
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

function TeacherSearchSpeakerPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [open, setOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>(speakers);
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

  // Apply filters and search
  useEffect(() => {
    let result = [...speakers];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(speaker => 
        speaker.name.toLowerCase().includes(query) ||
        speaker.organization.toLowerCase().includes(query) ||
        speaker.bio.toLowerCase().includes(query) ||
        speaker.location.toLowerCase().includes(query)
      );
    }
    
    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      result = result.filter(speaker => 
        filters.industry.some(industry => 
          speaker.industry?.includes(industry)
        )
      );
    }
    
    // Apply grade level filter
    if (filters.grades && filters.grades.length > 0) {
      result = result.filter(speaker => 
        filters.grades.some(grade => 
          speaker.grades?.includes(grade)
        )
      );
    }
    
    // Apply location filter
    if (filters.city && filters.city.trim() !== '') {
      result = result.filter(speaker => 
        speaker.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    if (filters.state && filters.state.trim() !== '') {
      result = result.filter(speaker => 
        speaker.state?.toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    // Apply radius filter if coordinates are available
    if (filters.radius && filters.radius > 0 && filters.userCoordinates) {
      const { lat: userLat, lng: userLng } = filters.userCoordinates;
      
      result = result.filter(speaker => {
        if (!speaker.coordinates) return true;
        const distance = calculateDistance(
          userLat, 
          userLng, 
          speaker.coordinates.lat, 
          speaker.coordinates.lng
        );
        return distance <= filters.radius;
      });
    }
    
    // Apply format filter
    if (filters.formats) {
      if (filters.formats.inperson && !filters.formats.virtual) {
        result = result.filter(speaker => speaker.inperson);
      } else if (!filters.formats.inperson && filters.formats.virtual) {
        result = result.filter(speaker => speaker.virtual);
      } else if (filters.formats.inperson && filters.formats.virtual) {
        result = result.filter(speaker => speaker.inperson || speaker.virtual);
      }
    }
    
    // Apply language filter
    if (filters.languages && filters.languages.length > 0) {
      result = result.filter(speaker => 
        filters.languages.some(language => 
          speaker.languages?.includes(language)
        )
      );
    }
    
    setFilteredSpeakers(result);
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCardClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setOpen(true);
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

  return (
    <div className="flex-div">
      <TopBar />
      <Sidebar />
      <div className="main-window">
        <div className="request-stack">
          <Section>
            <SectionTitle>Available Speakers</SectionTitle>
            
            <SearchFilterContainer>
              <Box sx={{ flexGrow: 1 }}>
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Type your search..."
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

            <CardContainer>
              {filteredSpeakers.length > 0 ? (
                filteredSpeakers.map((speaker) => (
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
                <Typography variant="body1" sx={{ p: 2 }}>
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

export default TeacherSearchSpeakerPage;
