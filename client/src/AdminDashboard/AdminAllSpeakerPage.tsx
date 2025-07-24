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
  Grid,
  FormControlLabel,
  Switch,
  FormLabel,
  RadioGroup,
  FormControl,
  Radio,
  CardMedia,
  Chip,
  Collapse,
  Alert,
  Snackbar,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import './AdminDashboard.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, {
  FilterState,
} from '../components/SpeakerFilterPanel';
import { getData, putData, deleteData } from '../util/api.tsx';
import MultiSelect from './MultiSelect';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';

// Updated Speaker interface with new fields for filtering
interface Speaker {
  _id: string;
  userId:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string
    | null;
  organization: string;
  bio: string;
  location: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
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
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  padding: '20px',
  width: '100%',
  boxSizing: 'border-box',
  maxWidth: '1200px',
  margin: '0 auto',
});

const GridItem = styled(Grid)({
  display: 'flex',
  justifyContent: 'center',
  padding: '10px',
  width: '100%',
  boxSizing: 'border-box',
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
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
});

const SectionTitle = styled('h2')({
  textAlign: 'left',
  padding: '0 20px',
  color: '#2c3e50',
  borderBottom: '2px solid #3498db',
  paddingBottom: '10px',
  marginBottom: '20px',
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


const getUserIdString = (userId: Speaker['userId']): string | null => {
  if (!userId) return null;
  if (typeof userId === 'string') return userId;
  if ('_id' in userId) return userId._id;
  return null;
};

const gradeOptions = ['Elementary', 'Middle School', 'High School'];

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
    organization: '',
    bio: '',
    location: '',
    inperson: false,
    virtual: false,
    imageUrl: '',
    industry: [] as string[],
    grades: [] as string[],
    languages: [] as string[],
    jobTitle: '',
    website: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);
  const [industryFocusError, setIndustryFocusError] = useState<string | null>(null);

  // Load speakers from backend
  useEffect(() => {
    const fetchSpeakers = async () => {
      const response = await getData('speaker/all');
      if (response.error) {
        setError('Failed to fetch speakers: ' + response.error.message);
        return;
      }
      console.log('Fetched speakers:', response.data);
      setSpeakers(response.data);
      setFilteredSpeakers(response.data);
    };
    fetchSpeakers();
  }, []);

  useEffect(() => {
    // Fetch industry focuses for edit dialog
    const fetchIndustryFocuses = async () => {
      try {
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
        setIndustryFocusError(null);
      } catch (error) {
        setIndustryFocusError('Failed to load industry focuses. Please try again later.');
      } finally {
        setLoadingFocuses(false);
      }
    };
    fetchIndustryFocuses();
  }, []);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Apply both search and filters
  const applyFiltersAndSearch = (speakersToFilter: Speaker[]) => {
    let result = [...speakersToFilter];

    // Apply search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter((speaker) => {
        const fullName =
          typeof speaker.userId === 'object' && speaker.userId !== null
            ? `${speaker.userId.firstName} ${speaker.userId.lastName}`.toLowerCase()
            : '';
        return (
          fullName.includes(lowercaseQuery) ||
          speaker.organization.toLowerCase().includes(lowercaseQuery) ||
          speaker.bio.toLowerCase().includes(lowercaseQuery) ||
          speaker.location.toLowerCase().includes(lowercaseQuery)
        );
      });
    }

    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      result = result.filter((speaker) =>
        filters.industry.some((industry) =>
          speaker.industry.includes(industry),
        ),
      );
    }

    // Apply grades filter
    if (filters.grades && filters.grades.length > 0) {
      result = result.filter((speaker) =>
        filters.grades.some((grade) => speaker.grades.includes(grade)),
      );
    }

    // Apply location filter
    if (filters.city && filters.city.trim() !== '') {
      result = result.filter(
        (speaker) =>
          speaker.city &&
          speaker.city.toLowerCase() === filters.city.toLowerCase(),
      );
    }

    if (filters.state && filters.state.trim() !== '') {
      result = result.filter(
        (speaker) =>
          speaker.state &&
          speaker.state.toLowerCase() === filters.state.toLowerCase(),
      );
    }

    // Apply radius filter
    if (filters.radius && filters.radius > 0 && filters.userCoordinates) {
      const { lat: userLat, lng: userLng } = filters.userCoordinates;

      result = result.filter((speaker) => {
        if (
          !speaker.coordinates ||
          !speaker.coordinates.lat ||
          !speaker.coordinates.lng
        ) {
          return true;
        }

        const distance = calculateDistance(
          userLat,
          userLng,
          speaker.coordinates.lat,
          speaker.coordinates.lng,
        );

        return distance <= filters.radius;
      });
    }

    // Apply format filter
    if (filters.formats) {
      if (
        filters.formats.inperson === true &&
        filters.formats.virtual !== true
      ) {
        result = result.filter((speaker) => speaker.inperson === true);
      } else if (
        filters.formats.inperson !== true &&
        filters.formats.virtual === true
      ) {
        result = result.filter((speaker) => speaker.virtual === true);
      } else if (
        filters.formats.inperson === true &&
        filters.formats.virtual === true
      ) {
        result = result.filter(
          (speaker) => speaker.inperson === true || speaker.virtual === true,
        );
      }
    }

    // Apply language filter
    if (filters.languages && filters.languages.length > 0) {
      result = result.filter((speaker) =>
        filters.languages.some(
          (language) =>
            speaker.languages && speaker.languages.includes(language),
        ),
      );
    }

    return result;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSpeakers(speakers);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results = speakers.filter((speaker) => {
      const fullName =
        typeof speaker.userId === 'object' && speaker.userId !== null
          ? `${speaker.userId.firstName} ${speaker.userId.lastName}`.toLowerCase()
          : '';
      return (
        fullName.includes(lowercaseQuery) ||
        speaker.organization.toLowerCase().includes(lowercaseQuery) ||
        speaker.bio.toLowerCase().includes(lowercaseQuery) ||
        speaker.location.toLowerCase().includes(lowercaseQuery)
      );
    });

    setFilteredSpeakers(results);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);
    applyFiltersAndSearch(speakers);
  };

  const handleCardClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (speaker: Speaker) => {
    if (!speaker) return;
    setSelectedSpeaker(speaker);
    
    // Extract firstName and lastName from the populated userId object
    const firstName = typeof speaker.userId === 'object' && speaker.userId !== null 
      ? speaker.userId.firstName 
      : '';
    const lastName = typeof speaker.userId === 'object' && speaker.userId !== null 
      ? speaker.userId.lastName 
      : '';
    
    setEditFormState({
      firstName,
      lastName,
      organization: speaker.organization,
      bio: speaker.bio,
      location: speaker.location,
      inperson: speaker.inperson,
      virtual: speaker.virtual || false,
      imageUrl: speaker.imageUrl || '',
      industry: speaker.industry || [],
      grades: speaker.grades || [],
      languages: speaker.languages || ['English'],
      jobTitle: (speaker as any).jobTitle || '',
      website: (speaker as any).website || '',
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

  // Handle file input for image upload
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 1MB
      if (file.size > 14 * 1024 * 1024) {
        setError('Image file is too large (max 14MB). Please choose a smaller image.');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEditFormState((prev) => ({
          ...prev,
          imageUrl: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilterPanelToggle = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const handleSaveEdit = async () => {
    try {
      if (selectedSpeaker) {
        // First check if user is authenticated and has admin privileges
        const authStatus = await getData('auth/authstatus');
        if (authStatus.error) {
          throw new Error('You must be logged in to edit a speaker');
        }

        const adminStatus = await getData('admin/adminstatus');
        if (adminStatus.error) {
          throw new Error('You must be an admin to edit a speaker');
        }

        // Get the userId string from the selected speaker
        const userIdStr = getUserIdString(selectedSpeaker.userId);
        if (!userIdStr) throw new Error('Speaker userId is missing');
        console.log('userIdStr:', userIdStr);

        // Format the update data to match the speaker schema and include user data
        const updateData = {
          firstName: editFormState.firstName,
          lastName: editFormState.lastName,
          organization: editFormState.organization,
          bio: editFormState.bio,
          location: editFormState.location,
          inperson: editFormState.inperson,
          virtual: editFormState.virtual,
          imageUrl: editFormState.imageUrl,
          industry: editFormState.industry,
          grades: editFormState.grades,
          languages: editFormState.languages,
        };
        const speakersResponse2 = await getData('speaker/all');
        console.log('All Speakers:', speakersResponse2.data);
        console.log('Updating speaker with data:', updateData);
        const response = await putData(`speaker/${userIdStr}`, updateData);
        if (response.error) {
          throw new Error(response.error.message);
        }

        // Refetch all speakers to get the updated data
        const speakersResponse = await getData('speaker/all');
        console.log('All Speakers:', speakersResponse.data);
        if (speakersResponse.error) {
          throw new Error(
            'Failed to fetch updated speakers: ' +
              speakersResponse.error.message,
          );
        }

        // Update the speakers state with the fresh data
        setSpeakers(speakersResponse.data);

        // Reapply filters and search to update filteredSpeakers
        const updatedFilteredSpeakers = applyFiltersAndSearch(
          speakersResponse.data,
        );
        setFilteredSpeakers(updatedFilteredSpeakers);

        setSuccess('Speaker updated successfully');
      }
      setEditOpen(false);
    } catch (error) {
      setError(
        'Failed to update speaker: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedSpeaker) {
        const userIdStr = getUserIdString(selectedSpeaker.userId);
        if (!userIdStr) throw new Error('Speaker userId is missing');

        // First check if user is authenticated and has admin privileges
        const authStatus = await getData('auth/authstatus');
        if (authStatus.error) {
          throw new Error('You must be logged in to delete a speaker');
        }

        const adminStatus = await getData('admin/adminstatus');
        if (adminStatus.error) {
          throw new Error('You must be an admin to delete a speaker');
        }

        const response = await deleteData(`speaker/${userIdStr}`);
        if (response.error) {
          throw new Error(response.error.message);
        }

        // Remove the deleted speaker from the local state
        setSpeakers(
          speakers.filter((speaker) => {
            const speakerUserId = getUserIdString(speaker.userId);
            return speakerUserId !== userIdStr;
          }),
        );

        // Also update filtered speakers
        setFilteredSpeakers(
          filteredSpeakers.filter((speaker) => {
            const speakerUserId = getUserIdString(speaker.userId);
            return speakerUserId !== userIdStr;
          }),
        );

        setSuccess('Speaker deleted successfully');
      }
      setDeleteOpen(false);
    } catch (error) {
      setError(
        'Failed to delete speaker: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
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
            {filteredSpeakers.map((speaker) => {
              const speakerName =
                typeof speaker.userId === 'object' && speaker.userId !== null
                  ? `${speaker.userId.firstName} ${speaker.userId.lastName}`
                  : 'Loading...';
              return (
                <div key={speaker._id} style={{ position: 'relative' }}>
                  <SpeakerCard
                    id={speaker._id}
                    name={speakerName}
                    bio={speaker.bio}
                    organization={speaker.organization}
                    location={speaker.location}
                    imageUrl={speaker.imageUrl}
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
                  </SpeakerCard>
                </div>
              );
            })}
          </CardContainer>
        </Section>

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
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  {typeof selectedSpeaker.userId === 'object' &&
                  selectedSpeaker.userId !== null
                    ? `${selectedSpeaker.userId.firstName} ${selectedSpeaker.userId.lastName}`
                    : 'Loading...'}
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
                    alt={`${
                      typeof selectedSpeaker.userId === 'object' &&
                      selectedSpeaker.userId !== null
                        ? `${selectedSpeaker.userId.firstName} ${selectedSpeaker.userId.lastName}`
                        : 'Speaker'
                    }`}
                    sx={{
                      width: { xs: '100%', md: '40%' },
                      height: 'auto',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      maxHeight: '400px',
                    }}
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>,
                    ) => {
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
                        {typeof selectedSpeaker.userId === 'object' &&
                        selectedSpeaker.userId !== null
                          ? selectedSpeaker.userId.email
                          : 'Loading...'}
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
        <Dialog
          open={editOpen}
          onClose={handleEditClose}
          maxWidth="md"
          fullWidth
        >
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={editFormState.firstName}
                  onChange={handleEditFormChange}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={editFormState.lastName}
                  onChange={handleEditFormChange}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Job Title (optional)"
                name="jobTitle"
                value={editFormState.jobTitle}
                onChange={handleEditFormChange}
                fullWidth
              />
              <TextField
                label="LinkedIn/Website (optional)"
                name="website"
                value={editFormState.website}
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
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                Profile Picture
              </Typography>
              {/* Image preview and upload */}
              {editFormState.imageUrl && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Current Profile Picture:</Typography>
                  <img
                    src={editFormState.imageUrl}
                    alt="Profile Preview"
                    style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginTop: 4 }}
                  />
                </Box>
              )}
              <Box sx={{ mt: 1, mb: 2 }}>
                <input type="file" accept="image/*" onChange={handleEditFileChange} />
              </Box>
              <MultiSelect
                label="Industry Focus"
                selectOptions={industryFocuses.map(focus => focus.name)}
                handleChange={(e) => {
                  const {
                    target: { value },
                  } = e;
                  setEditFormState((prev) => ({
                    ...prev,
                    industry: typeof value === 'string' ? value.split(',') : value,
                  }));
                }}
                value={editFormState.industry}
                loading={loadingFocuses}
                error={industryFocusError}
              />
              <MultiSelect
                label="Grades"
                selectOptions={gradeOptions}
                handleChange={(e) => {
                  const {
                    target: { value },
                  } = e;
                  setEditFormState((prev) => ({
                    ...prev,
                    grades: typeof value === 'string' ? value.split(',') : value,
                  }));
                }}
                value={editFormState.grades}
              />
              <FormControl fullWidth>
                <FormLabel component="legend">Languages</FormLabel>
                <Select
                  multiple
                  value={editFormState.languages}
                  onChange={(e) => {
                    const {
                      target: { value },
                    } = e;
                    setEditFormState((prev) => ({
                      ...prev,
                      languages: typeof value === 'string' ? value.split(',') : value,
                    }));
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {['English', 'Spanish', 'Mandarin', 'French', 'Other'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Button
              onClick={handleSaveEdit}
              color="primary"
              variant="contained"
            >
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
              {selectedSpeaker &&
              typeof selectedSpeaker.userId === 'object' &&
              selectedSpeaker.userId !== null
                ? `${selectedSpeaker.userId.firstName} ${selectedSpeaker.userId.lastName}`
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
    </div>
  );
}

export default AdminAllSpeakerPage;
