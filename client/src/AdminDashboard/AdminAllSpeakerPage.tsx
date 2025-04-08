import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  FormLabel,
  RadioGroup,
  FormControl,
  Radio,
  CardMedia,
  Chip,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import './AdminDashboard.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, { FilterState } from '../components/SpeakerFilterPanel';

// Updated Speaker interface with new fields for filtering
interface Speaker {
  _id: string;
  userId: string;
  organization: string;
  bio: string;
  location: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  // New fields for filtering
  industry: string[];
  grades: string[];
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages: string[];
}

const CardContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  justifyContent: 'flex-start',
  padding: '20px',
});

const ActionButton = styled(Button)({
  margin: '10px',
});

// Styled components for the dialog
const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
});

const Section = styled('div')({
  marginBottom: '40px',
});

const SectionTitle = styled('h2')({
  textAlign: 'left',
  color: '#2c3e50',
  borderBottom: '2px solid #3498db',
  paddingBottom: '10px',
  marginBottom: '20px',
});

// Updated TEST_SPEAKERS with new fields
const TEST_SPEAKERS: Speaker[] = [
  {
    _id: '1',
    userId: 'user1',
    organization: 'Environmental Education Center',
    bio: 'Expert in environmental education',
    location: 'New York, NY',
    city: 'New York',
    state: 'NY',
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    },
    inperson: true,
    virtual: false,
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
    user: {
      firstName: 'Edward',
      lastName: 'Zhang',
      email: 'edward@xxx.org',
    },
    industry: ['Environmental', 'Education'],
    grades: ['Elementary', 'Middle School'],
    languages: ['English', 'Mandarin']
  },
  {
    _id: '2',
    userId: 'user2',
    organization: 'Climate Research Institute',
    bio: 'Climate change researcher',
    location: 'Boston, MA',
    city: 'Boston',
    state: 'MA',
    coordinates: {
      lat: 42.3601,
      lng: -71.0589
    },
    inperson: true,
    virtual: true,
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    user: {
      firstName: 'Khoi',
      lastName: 'Dinh',
      email: 'khoi@xxx.org',
    },
    industry: ['Environment', 'Science', 'Technology'],
    grades: ['High School'],
    languages: ['English', 'Vietnamese']
  },
  {
    _id: '3',
    userId: 'user3',
    organization: 'Sustainability Foundation',
    bio: 'Sustainability consultant',
    location: 'San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    coordinates: {
      lat: 37.7749,
      lng: -122.4194
    },
    inperson: false,
    virtual: true,
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
    user: {
      firstName: 'Evelyn',
      lastName: 'Li',
      email: 'evelyn@xxx.org',
    },
    industry: ['Business', 'Sustainability'],
    grades: ['Middle School', 'High School'],
    languages: ['English', 'Spanish']
  },
];

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

function AdminAllSpeakerPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
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
  const [editFormState, setEditFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    bio: '',
    location: '',
    inperson: false,
    virtual: false,
    imageUrl: '',
    industry: [] as string[],
    grades: [] as string[],
    city: '',
    state: '',
    languages: [] as string[],
  });
  
  // Load speakers
  useEffect(() => {
    // In a real app, fetch speakers from API
    setSpeakers(TEST_SPEAKERS);
    setFilteredSpeakers(TEST_SPEAKERS);
  }, []);
  
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


  // Apply filters to speakers
useEffect(() => {
    let result = [...speakers];
    
    // Filter by industry (optional)
    if (filters.industry && filters.industry.length > 0) {
      result = result.filter(speaker => 
        filters.industry.some(industry => 
          speaker.industry.includes(industry)
        )
      );
    }
    
    // Filter by grades (optional)
    if (filters.grades && filters.grades.length > 0) {
      result = result.filter(speaker => 
        filters.grades.some(grade => 
          speaker.grades.includes(grade)
        )
      );
    }
    
    // Filter by location (city, state) - all optional
    if (filters.city && filters.city.trim() !== '') {
      result = result.filter(speaker => 
        speaker.city && speaker.city.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    if (filters.state && filters.state.trim() !== '') {
      result = result.filter(speaker => 
        speaker.state && speaker.state.toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    // Filter by radius (optional) - only if coordinates are available
    if (filters.radius && filters.radius > 0 && filters.userCoordinates) {
      const { lat: userLat, lng: userLng } = filters.userCoordinates;
      
      result = result.filter(speaker => {
        if (!speaker.coordinates || !speaker.coordinates.lat || !speaker.coordinates.lng) {
          return true; // Keep speakers without coordinates when filtering by radius
        }
        
        const distance = calculateDistance(
          userLat, 
          userLng, 
          speaker.coordinates.lat, 
          speaker.coordinates.lng
        );
        
        return distance <= filters.radius;
      });
    }
    
    // Filter by formats (optional)
    if (filters.formats) {
      if (filters.formats.inperson === true && filters.formats.virtual !== true) {
        result = result.filter(speaker => speaker.inperson === true);
      } else if (filters.formats.inperson !== true && filters.formats.virtual === true) {
        result = result.filter(speaker => speaker.virtual === true);
      } else if (filters.formats.inperson === true && filters.formats.virtual === true) {
        result = result.filter(speaker => speaker.inperson === true || speaker.virtual === true);
      }
      // If both are false or undefined, don't filter by format
    }
    
    // Filter by languages (optional)
    if (filters.languages && filters.languages.length > 0) {
      result = result.filter(speaker => 
        filters.languages.some(language => 
          speaker.languages && speaker.languages.includes(language)
        )
      );
    }
    
    setFilteredSpeakers(result);
  }, [filters, speakers]);


  const handleSearch = (query: string) => {
    console.log('Searching speakers for:', query);
    if (!query.trim()) {
      setFilteredSpeakers(speakers);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const results = speakers.filter(speaker => {
      const fullName = `${speaker.user?.firstName} ${speaker.user?.lastName}`.toLowerCase();
      return fullName.includes(lowercaseQuery) || 
             speaker.organization.toLowerCase().includes(lowercaseQuery) ||
             speaker.bio.toLowerCase().includes(lowercaseQuery) ||
             speaker.location.toLowerCase().includes(lowercaseQuery);
    });
    
    setFilteredSpeakers(results);
  };

  const handleCardClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setEditFormState({
      firstName: speaker.user?.firstName || '',
      lastName: speaker.user?.lastName || '',
      email: speaker.user?.email || '',
      organization: speaker.organization,
      bio: speaker.bio,
      location: speaker.location,
      inperson: speaker.inperson,
      virtual: speaker.virtual || false,
      imageUrl: speaker.imageUrl || '',
      industry: speaker.industry || [],
      grades: speaker.grades || [],
      city: speaker.city || '',
      state: speaker.state || '',
      languages: speaker.languages || ['English'],
    });
    setEditOpen(true);
  };

  const handleDelete = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setDeleteOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormState({
      ...editFormState,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFilterPanelToggle = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      if (selectedSpeaker) {
        // In a real app, make API call to update speaker
        console.log('Updating speaker:', selectedSpeaker._id, editFormState);

        // Update the speakers state with all fields including new ones
        const updatedSpeakers = speakers.map((speaker) =>
          speaker._id === selectedSpeaker._id
            ? {
                ...speaker,
                organization: editFormState.organization,
                bio: editFormState.bio,
                location: editFormState.location,
                inperson: editFormState.inperson,
                virtual: editFormState.virtual,
                imageUrl: editFormState.imageUrl,
                industry: editFormState.industry,
                grades: editFormState.grades,
                city: editFormState.city,
                state: editFormState.state,
                languages: editFormState.languages,
                user: {
                  firstName: editFormState.firstName,
                  lastName: editFormState.lastName,
                  email: editFormState.email,
                },
              }
            : speaker
        );
        
        setSpeakers(updatedSpeakers);
      }
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating speaker:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedSpeaker) {
        // In a real app, make API call to delete speaker
        console.log('Deleting speaker:', selectedSpeaker._id);

        // Update the speakers state
        setSpeakers(
          speakers.filter((speaker) => speaker._id !== selectedSpeaker._id),
        );
      }
      setDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting speaker:', error);
    }
  };

  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />
      <div className="main-window">
        <Section>
          <SectionTitle>All Speakers</SectionTitle>
          
          <SearchFilterContainer>
            <Box sx={{ flexGrow: 1 }}>
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search speakers..." 
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
            {filteredSpeakers.map((speaker) => (
              <div key={speaker._id} style={{ position: 'relative' }}>
                <div
                  onClick={() => handleCardClick(speaker)}
                  style={{ cursor: 'pointer' }}
                >
                  <SpeakerCard
                    id={speaker._id}
                    name={`${speaker.user?.firstName} ${speaker.user?.lastName}`}
                    bio={speaker.bio}
                    organization={speaker.organization}
                    location={speaker.location}
                    imageUrl={speaker.imageUrl}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 10,
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(speaker);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(speaker);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </CardContainer>
        </Section>
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
                {`${selectedSpeaker.user?.firstName} ${selectedSpeaker.user?.lastName}`}
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
                  alt={`${selectedSpeaker.user?.firstName} ${selectedSpeaker.user?.lastName}`}
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
                      {selectedSpeaker.user?.email}
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
            <DialogActions>
              <Button
                onClick={() => {
                  handleClose();
                  handleEdit(selectedSpeaker);
                }}
                color="primary"
                startIcon={<EditIcon />}
              >
                Edit Speaker
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Speaker</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { my: 1 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TextField
              label="First Name"
              name="firstName"
              value={editFormState.firstName}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={editFormState.lastName}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={editFormState.email}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label="Organization"
              name="organization"
              value={editFormState.organization}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label="Bio"
              name="bio"
              value={editFormState.bio}
              onChange={handleEditFormChange}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Location"
              name="location"
              value={editFormState.location}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label="Image URL"
              name="imageUrl"
              value={editFormState.imageUrl}
              onChange={handleEditFormChange}
              fullWidth
            />
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Speaking Format</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormState.inperson}
                    onChange={handleEditFormChange}
                    name="inperson"
                  />
                }
                label="In-person"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormState.virtual}
                    onChange={handleEditFormChange}
                    name="virtual"
                  />
                }
                label="Virtual"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            {selectedSpeaker
              ? `${selectedSpeaker.user?.firstName} ${selectedSpeaker.user?.lastName}`
              : 'this speaker'}
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminAllSpeakerPage;
