import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  Divider,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import SpeakerRequestCard from '../components/cards/SpeakerRequestCard';
import {
  getAllRequests,
  updateRequestStatus,
  Request,
  RequestStatus,
} from './requestApi';
import './AdminDashboard.css';
import { DEFAULT_IMAGE } from '../components/cards/SpeakerCard';
import { getData } from '../util/api.tsx';

const Section = styled('div')({
  marginBottom: '40px',
});

const SectionTitle = styled('h2')({
  textAlign: 'left',
  color: '#2c3e50',
  borderBottom: '2px solid #3498db',
  paddingBottom: '10px',
});

const CardContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  justifyContent: 'flex-start',
});

// Styled components for the dialog
const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
});

function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loadingTeacherProfile, setLoadingTeacherProfile] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRequests = await getAllRequests();
      setRequests(fetchedRequests);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    requestId: string,
    newStatus: RequestStatus,
  ) => {
    try {
      setUpdatingStatus(requestId);
      const updatedRequest = await updateRequestStatus(requestId, newStatus);

      setRequests(
        requests.map((request) =>
          request._id === requestId ? updatedRequest : request,
        ),
      );

      // Update selected request if it's the one being updated
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest(updatedRequest);
      }
    } catch (err) {
      setError('Failed to update request status. Please try again.');
      console.error('Error updating request status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCardClick = async (request: Request) => {
    console.log('Request clicked:', request);
    console.log('Teacher data:', request.teacher);
    console.log('TeacherId data:', request.teacherId);
    setSelectedRequest(request);
    setOpen(true);
    
    // Fetch teacher profile data for the dialog
    if (request.teacher?._id) {
      setLoadingTeacherProfile(true);
      try {
        const response = await getData(`teacher/${request.teacher._id}`);
        if (response.data) {
          setTeacherProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching teacher profile:', error);
      } finally {
        setLoadingTeacherProfile(false);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
    setTeacherProfile(null);
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

  const RequestCard = ({ request }: { request: Request }) => (
    <Card sx={{ width: 300, mb: 2 }}>
      <CardContent>
        <div
          onClick={() => handleCardClick(request)}
          style={{ cursor: 'pointer' }}
        >
          <SpeakerRequestCard
            id={request._id}
            speaker={request.speaker || request.speakerId}
            teacher={request.teacher || request.teacherId}
            status={request.status}
          />
        </div>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={request.status}
            label="Status"
            disabled={updatingStatus === request._id}
            onChange={(e) =>
              handleStatusChange(request._id, e.target.value as RequestStatus)
            }
          >
            <MenuItem value="Pending Review">Pending Review</MenuItem>
            <MenuItem value="Pending Speaker Confirmation">
              Pending Speaker Confirmation
            </MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>
        </FormControl>
        {updatingStatus === request._id && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex-div">
        <TopBar />
        <AdminSidebar />
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
      <AdminSidebar />
      <div className="main-window">
        <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50' }}>
          Speaker Requests Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Section>
          <SectionTitle>Pending Review</SectionTitle>
          <CardContainer>
            {requests
              .filter((req) => req.status === 'Pending Review')
              .map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            {requests.filter((req) => req.status === 'Pending Review')
              .length === 0 && (
              <Typography variant="body1" color="text.secondary">
                No requests pending review
              </Typography>
            )}
          </CardContainer>
        </Section>

        <Section>
          <SectionTitle>Pending Speaker Confirmation</SectionTitle>
          <CardContainer>
            {requests
              .filter((req) => req.status === 'Pending Speaker Confirmation')
              .map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            {requests.filter(
              (req) => req.status === 'Pending Speaker Confirmation',
            ).length === 0 && (
              <Typography variant="body1" color="text.secondary">
                No requests pending speaker confirmation
              </Typography>
            )}
          </CardContainer>
        </Section>

        <Section>
          <SectionTitle>Approved</SectionTitle>
          <CardContainer>
            {requests
              .filter((req) => req.status === 'Approved')
              .map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            {requests.filter((req) => req.status === 'Approved').length ===
              0 && (
              <Typography variant="body1" color="text.secondary">
                No approved requests
              </Typography>
            )}
          </CardContainer>
        </Section>

        <Section>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <SectionTitle>Archived</SectionTitle>
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
              {requests
                .filter((req) => req.status === 'Archived')
                .map((request) => (
                  <RequestCard key={request._id} request={request} />
                ))}
              {requests.filter((req) => req.status === 'Archived').length ===
                0 && (
                <Typography variant="body1" color="text.secondary">
                  No archived requests
                </Typography>
              )}
            </CardContainer>
          </Collapse>
        </Section>

        {/* Request Details Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              width: '90%',
              maxWidth: '1000px',
              overflow: 'hidden',
            },
          }}
        >
          {selectedRequest && (
            <>
              <StyledDialogTitle>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  Request Details
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
                  {/* Speaker Information */}
                  <Box sx={{ width: { xs: '100%', md: '40%' } }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}
                    >
                      Speaker Information
                    </Typography>

                    <Box
                      component="img"
                      src={selectedRequest.speakerId.imageUrl || DEFAULT_IMAGE}
                      alt={`${selectedRequest.speakerId.userId.firstName} ${selectedRequest.speakerId.userId.lastName}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        maxHeight: '300px',
                        mb: 2,
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_IMAGE;
                        target.onerror = null;
                      }}
                    />

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: '#3498db', fontWeight: 600 }}
                    >
                      {selectedRequest.speakerId.userId.firstName}{' '}
                      {selectedRequest.speakerId.userId.lastName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                      <Typography variant="body1">
                        {selectedRequest.speakerId.userId.email}
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: 'text.secondary', mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {selectedRequest.speakerId.organization}
                    </Typography>

                    {selectedRequest.speakerId.jobTitle && (
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}
                      >
                        {selectedRequest.speakerId.jobTitle}
                      </Typography>
                    )}

                    <Typography variant="body2" sx={{ mb: 2, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {selectedRequest.speakerId.inperson && (
                        <Chip
                          icon={<PersonIcon />}
                          label="In-person"
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {selectedRequest.speakerId.virtual && (
                        <Chip
                          icon={<VideocamIcon />}
                          label="Virtual"
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography variant="body1" paragraph sx={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      {selectedRequest.speakerId.bio}
                    </Typography>

                    {/* Teacher Information */}
                    <Typography
                      variant="h6"
                      sx={{ mt: 3, mb: 2, fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #bdc3c7', pb: 1 }}
                    >
                      Teacher Information
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teacher Name
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {selectedRequest.teacherId
                          ? `${selectedRequest.teacherId.firstName} ${selectedRequest.teacherId.lastName}`
                          : 'Unknown Teacher'}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teacher Email
                      </Typography>
                      <Typography variant="body1" sx={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {selectedRequest.teacherId
                          ? selectedRequest.teacherId.email
                          : 'Unknown Email'}
                      </Typography>
                      
                      {/* Teacher Profile Information */}
                      {loadingTeacherProfile && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                          <CircularProgress size={20} />
                        </Box>
                      )}
                      
                      {teacherProfile && !loadingTeacherProfile && (
                        <>
                          {/* School Information */}
                          {teacherProfile.school && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">
                                School
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                {teacherProfile.school}
                              </Typography>
                            </>
                          )}
                          
                          {/* Grade Level */}
                          {teacherProfile.gradeLevel && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">
                                Grade Level
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                {teacherProfile.gradeLevel}
                              </Typography>
                            </>
                          )}
                          
                          {/* Location */}
                          {(teacherProfile.city || teacherProfile.state) && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">
                                Location
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                {[teacherProfile.city, teacherProfile.state].filter(Boolean).join(', ')}
                              </Typography>
                            </>
                          )}
                          
                          {/* Subjects */}
                          {teacherProfile.subjects && teacherProfile.subjects.length > 0 && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">
                                Subjects Taught
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {teacherProfile.subjects.map((subject: string, index: number) => (
                                  <Chip
                                    key={index}
                                    label={subject}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </>
                          )}
                          
                          {/* Bio */}
                          {teacherProfile.bio && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">
                                About the Teacher
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                mb: 1, 
                                fontSize: '0.9rem', 
                                lineHeight: 1.4,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {teacherProfile.bio}
                              </Typography>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Request Details */}
                  <Box sx={{ width: { xs: '100%', md: '60%' } }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}
                    >
                      Request Information
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

                    <Grid container spacing={2}>
                      {/* Audience Information */}
                      <Grid item xs={12}>
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
                      </Grid>
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

                      {/* Event Details */}
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
                          Event Details
                        </Typography>
                      </Grid>
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
                            : new Date(
                                selectedRequest.dateTime,
                              ).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Event Location
                        </Typography>
                        <Typography variant="body1">
                        {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
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

                      {/* Speaker Preferences */}
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
                          Speaker Preferences
                        </Typography>
                      </Grid>
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
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
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

                    {/* Status Update Section */}
                    <Divider sx={{ my: 3 }} />
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}
                    >
                      Update Status
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedRequest.status}
                        label="Status"
                        disabled={updatingStatus === selectedRequest._id}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedRequest._id,
                            e.target.value as RequestStatus,
                          )
                        }
                      >
                        <MenuItem value="Pending Review">
                          Pending Review
                        </MenuItem>
                        <MenuItem value="Pending Speaker Confirmation">
                          Pending Speaker Confirmation
                        </MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                    {updatingStatus === selectedRequest._id && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mt: 1,
                        }}
                      >
                        <CircularProgress size={20} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
}

export default AdminRequestsPage;
