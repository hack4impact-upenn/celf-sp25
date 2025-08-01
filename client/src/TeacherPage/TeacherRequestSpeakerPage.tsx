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
  Alert,
  CircularProgress,
  Divider,
  Grid,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SpeakerRequestCard from '../components/cards/SpeakerRequestCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import SearchBar from '../components/search_bar/SearchBar';
import './TeacherPage.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import SpeakerFilterPanel, {
  FilterState,
} from '../components/SpeakerFilterPanel';
import {
  getTeacherRequests,
  TeacherRequest,
  Speaker,
  Teacher,
  updateRequestStatus,
} from './teacherRequestApi';
import { useAppSelector } from '../util/redux/hooks.ts';

interface Request {
  _id: string;
  speaker: Speaker;
  teacher?: Teacher;
  status:
    | 'Pending Review'
    | 'Pending Speaker Confirmation'
    | 'Approved'
    | 'Archived';

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

  // Speaker Preferences
  expertise: string;
  preferredLanguage: string;
  city: string;
  state: string;
  country?: string;
  goals: string;
  budget?: string;
  engagementFormat: string;
  additionalInfo?: string; // Added for additional scheduling considerations
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

function TeacherRequestSpeakerPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
  const [requestToArchive, setRequestToArchive] = useState<string | null>(null);
  const [requestToUnarchive, setRequestToUnarchive] = useState<string | null>(null);
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
  });
  const [showArchived, setShowArchived] = useState(false);

  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const teacherRequests = await getTeacherRequests();

      console.log('Raw teacher requests from backend:', teacherRequests);

      // Transform the data to match our Request interface
      const transformedRequests: Request[] = teacherRequests.map((req) => {
        console.log('Processing request:', req._id, 'Teacher data:', req.teacherId);
        return {
          _id: req._id,
          speaker: req.speakerId, // The backend now returns populated speaker data
          teacher: req.teacherId, // Include teacher data
          status: req.status,
          date: req.dateTime,
          notes: req.eventPurpose,
          eventName: req.eventName,
          eventPurpose: req.eventPurpose,
          dateTime: req.dateTime,
          timezone: req.timezone,
          isInPerson: req.isInPerson,
          isVirtual: req.isVirtual,
          expertise: req.expertise,
          preferredLanguage: req.preferredLanguage,
          city: req.city,
          state: req.state,
          country: req.country,
          goals: req.goals,
          budget: req.budget,
          engagementFormat: req.engagementFormat,
          gradeLevels: req.gradeLevels,
          subjects: req.subjects,
          estimatedStudents: req.estimatedStudents,
          additionalInfo: req.additionalInfo, // Include additionalInfo
        };
      });

      console.log('Transformed requests:', transformedRequests);
      setRequests(transformedRequests);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    let result = [...requests];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter((request) => {
        const speakerName =
          `${request.speaker.userId.firstName} ${request.speaker.userId.lastName}`.toLowerCase();
        const organization = (request.speaker.organization || '').toLowerCase();
        const bio = (request.speaker.bio || '').toLowerCase();
        const city = (request.speaker.city || '').toLowerCase();
        const state = (request.speaker.state || '').toLowerCase();

        return (
          speakerName.includes(lowercaseQuery) ||
          organization.includes(lowercaseQuery) ||
          bio.includes(lowercaseQuery) ||
          state.includes(lowercaseQuery) ||
          city.includes(lowercaseQuery)
        );
      });
    }

    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      result = result.filter(
        (request) =>
          request.speaker.industry &&
          filters.industry.some((industry) =>
            request.speaker.industry.includes(industry),
          ),
      );
    }

    // Apply grade level filter
    if (filters.grades && filters.grades.length > 0) {
      result = result.filter(
        (request) =>
          request.speaker.grades &&
          filters.grades.some((grade) =>
            request.speaker.grades.includes(grade),
          ),
      );
    }

    // Apply location filter
    if (filters.city && filters.city.trim() !== '') {
      result = result.filter(
        (request) =>
          request.speaker.city &&
          request.speaker.city.toLowerCase() === filters.city.toLowerCase(),
      );
    }

    if (filters.state && filters.state.trim() !== '') {
      result = result.filter(
        (request) =>
          request.speaker.state &&
          request.speaker.state.toLowerCase() === filters.state.toLowerCase(),
      );
    }

    if (filters.country && filters.country.trim() !== '') {
      result = result.filter(
        (request) =>
          request.speaker.country &&
          request.speaker.country.toLowerCase() === filters.country.toLowerCase(),
      );
    }

    // Apply format filter
    if (filters.formats) {
      // If both formats are unchecked, show all requests
      if (!filters.formats.inperson && !filters.formats.virtual) {
        // No filtering needed
      } else {
        result = result.filter((request) => {
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
      result = result.filter(
        (request) =>
          request.speaker.languages &&
          filters.languages.some((language) =>
            request.speaker.languages.includes(language),
          ),
      );
    }

    return result;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCardClick = (request: Request) => {
    setSelectedRequest(request);
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

  const handleArchiveRequest = async (requestId: string) => {
    setRequestToArchive(requestId);
    setShowArchiveDialog(true);
  };

  const handleUnarchiveRequest = async (requestId: string) => {
    setRequestToUnarchive(requestId);
    setShowUnarchiveDialog(true);
  };

  const handleConfirmArchive = async () => {
    if (!requestToArchive) return;
    
    try {
      await updateRequestStatus(requestToArchive, 'Archived');
      // Refresh the requests list
      await fetchRequests();
      setSuccess('Request archived successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error archiving request:', error);
      setError('Failed to archive request. Please try again.');
    } finally {
      setShowArchiveDialog(false);
      setRequestToArchive(null);
    }
  };

  const handleConfirmUnarchive = async () => {
    if (!requestToUnarchive) return;
    
    try {
      await updateRequestStatus(requestToUnarchive, 'Pending Review');
      // Refresh the requests list
      await fetchRequests();
      setSuccess('Request unarchived successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error unarchiving request:', error);
      setError('Failed to unarchive request. Please try again.');
    } finally {
      setShowUnarchiveDialog(false);
      setRequestToUnarchive(null);
    }
  };

  const handleCancelArchive = () => {
    setShowArchiveDialog(false);
    setRequestToArchive(null);
  };

  const handleCancelUnarchive = () => {
    setShowUnarchiveDialog(false);
    setRequestToUnarchive(null);
  };

  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending review':
        return 'Pending Review';
      case 'pending speaker confirmation':
        return 'Pending Speaker Confirmation';
      case 'approved':
        return 'Approved';
      case 'archived':
        return 'Archived';
      default:
        return capitalizeFirstLetter(status);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending review':
        return 'warning';
      case 'pending speaker confirmation':
        return 'info';
      case 'approved':
        return 'success';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  // Define the order of status sections
  const statusOrder = [
    'pending review',
    'pending speaker confirmation',
    'approved',
    'archived',
  ];

  if (loading) {
    return (
      <div className="flex-div">
        <TopBar />
        <Sidebar />
        <div className="main-window">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-div">
      <TopBar />
      <Sidebar />
      <div className="main-window">
        <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50' }}>
          My Speaker Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

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

        {statusOrder.map((status) => {
          const requestsInStatus = groupedRequests[status] || [];
          if (requestsInStatus.length === 0) return null;

          // Special handling for archived section
          if (status === 'archived') {
            return (
              <Section key={status}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <SectionTitle>{getStatusTitle(status)}</SectionTitle>
                  <Button
                    onClick={() => setShowArchived(!showArchived)}
                    endIcon={showArchived ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    {showArchived ? 'Hide' : 'Show'} Archived
                  </Button>
                </Box>
                <Collapse in={showArchived}>
                  <CardContainer>
                    {requestsInStatus.map((request) => (
                      <div
                        key={request._id}
                        onClick={() => handleCardClick(request)}
                        style={{ cursor: 'pointer' }}
                      >
                        <SpeakerRequestCard
                          id={request._id}
                          speaker={request.speaker}
                          teacher={request.teacher}
                          status={request.status}
                          onUnarchive={() => handleUnarchiveRequest(request._id)}
                        />
                      </div>
                    ))}
                  </CardContainer>
                </Collapse>
              </Section>
            );
          }

          return (
            <Section key={status}>
              <SectionTitle>{getStatusTitle(status)}</SectionTitle>
              <CardContainer>
                {requestsInStatus.map((request) => (
                  <div
                    key={request._id}
                    onClick={() => handleCardClick(request)}
                    style={{ cursor: 'pointer' }}
                  >
                    <SpeakerRequestCard
                      id={request._id}
                      speaker={request.speaker}
                      teacher={request.teacher}
                      status={request.status}
                      onArchive={() => handleArchiveRequest(request._id)}
                    />
                  </div>
                ))}
              </CardContainer>
            </Section>
          );
        })}

        {getFilteredRequests().length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No requests found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
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
            overflow: 'hidden',
          },
        }}
      >
        {selectedRequest && (
          <>
            <StyledDialogTitle>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {selectedRequest.speaker.userId.firstName}{' '}
                {selectedRequest.speaker.userId.lastName}
              </Typography>
              <IconButton onClick={handleClose} size="large">
                <CloseIcon />
              </IconButton>
            </StyledDialogTitle>
            <DialogContent>
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 4,
                }}
              >
                <CardMedia
                  component="img"
                  image={selectedRequest.speaker.imageUrl || DEFAULT_IMAGE}
                  alt={`${selectedRequest.speaker.userId.firstName} ${selectedRequest.speaker.userId.lastName}`}
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
                    {selectedRequest.speaker.organization}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                    <Typography variant="body1">
                      {selectedRequest.speaker.userId.email}
                    </Typography>
                  </Box>

                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: 'text.secondary', mb: 2 }}
                  >
                    {[
                      selectedRequest.speaker.city,
                      selectedRequest.speaker.state
                    ].filter(Boolean).join(', ')}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {selectedRequest.speaker.inperson && (
                      <Chip
                        icon={<PersonIcon />}
                        label="In-person"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {selectedRequest.speaker.virtual && (
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
                    {selectedRequest.speaker.bio}
                  </Typography>

                  {/* Request Details Section */}
                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}
                  >
                    Request Details
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={selectedRequest.status}
                      color={
                        selectedRequest.status === 'Approved'
                          ? 'success'
                          : selectedRequest.status === 'Pending Review'
                          ? 'warning'
                          : selectedRequest.status ===
                            'Pending Speaker Confirmation'
                          ? 'info'
                          : 'default'
                      }
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  {/* Teacher Information */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '1px solid #bdc3c7',
                      pb: 1,
                    }}
                  >
                    Teacher Information
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teacher Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.teacher
                          ? `${selectedRequest.teacher.firstName} ${selectedRequest.teacher.lastName}`
                          : 'Unknown Teacher'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teacher Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.teacher
                          ? selectedRequest.teacher.email
                          : 'Unknown Email'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Audience Information */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '1px solid #bdc3c7',
                      pb: 1,
                    }}
                  >
                    Audience Information
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Grade Level(s)
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.gradeLevels.join(', ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Subject(s)
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.subjects.join(', ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estimated Students
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.estimatedStudents}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Event Details */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '1px solid #bdc3c7',
                      pb: 1,
                    }}
                  >
                    Event Details
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Event Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.eventName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Event Purpose
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.eventPurpose}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.timezone
                          ? formatDateTime(
                              selectedRequest.dateTime,
                              selectedRequest.timezone,
                            )
                          : new Date(selectedRequest.dateTime).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Event Location
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.city}, {selectedRequest.state}
                        {selectedRequest.country ? `, ${selectedRequest.country}` : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Format
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {selectedRequest.isInPerson && (
                          <Chip
                            icon={<PersonIcon />}
                            label="In-person"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {selectedRequest.isVirtual && (
                          <Chip
                            icon={<VideocamIcon />}
                            label="Virtual"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Speaker Preferences */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#2c3e50',
                      borderBottom: '1px solid #bdc3c7',
                      pb: 1,
                    }}
                  >
                    Speaker Preferences
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Required Expertise
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.expertise}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Preferred Language
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.preferredLanguage}
                      </Typography>
                    </Grid>
                    {selectedRequest.budget && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Budget Range
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.budget}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engagement Format
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.engagementFormat}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Goals & Objectives
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.goals}
                      </Typography>
                    </Grid>
                    {/* Move Additional Info to end of Event Details section */}
                    {selectedRequest.additionalInfo && (
                      <Grid item xs={12}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            color: '#2c3e50',
                            borderBottom: '1px solid #bdc3c7',
                            pb: 1,
                            mt: 2,
                          }}
                        >
                          Other Scheduling Considerations
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedRequest.additionalInfo}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onClose={handleCancelArchive}>
        <DialogTitle sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
          Archive Request
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to archive this request?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This will reset the approval process and move the request to archived status.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelArchive}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmArchive}
            color="error"
            variant="contained"
            sx={{
              backgroundColor: '#e74c3c',
              '&:hover': {
                backgroundColor: '#c0392b',
              },
            }}
          >
            Archive Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unarchive Confirmation Dialog */}
      <Dialog open={showUnarchiveDialog} onClose={handleCancelUnarchive}>
        <DialogTitle sx={{ color: '#3498db', fontWeight: 'bold' }}>
          Unarchive Request
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to unarchive this request?
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This will move the request back to "Pending Review" status.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Note:</strong> If you want to submit another event request, it's recommended to create a new request instead of unarchiving this one.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnarchive}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUnarchive}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: '#3498db',
              '&:hover': {
                backgroundColor: '#2980b9',
              },
            }}
          >
            Unarchive Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeacherRequestSpeakerPage;
