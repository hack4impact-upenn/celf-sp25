import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TopBar from '../components/top_bar/TopBar.tsx';
import COLORS from '../assets/colors.ts';
import { getData } from '../util/api.tsx';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  school?: string;
  gradeLevel?: string;
  city?: string;
  state?: string;
  subjects?: string[];
  bio?: string;
}

interface SpeakerRequest {
  _id: string;
  teacherId: Teacher;
  status: 'Pending Review' | 'Pending Speaker Confirmation' | 'Approved' | 'Archived';
  
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
  additionalInfo?: string;
  
  // Speaker Preferences
  expertise: string;
  preferredLanguage: string;
  location: string;
  goals: string;
  budget?: string;
  engagementFormat: string;
  
  createdAt: string;
  updatedAt: string;
}

function SpeakerRequestsPage() {
  const user = useAppSelector(selectUser);
  const [requests, setRequests] = useState<SpeakerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SpeakerRequest | null>(null);
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loadingTeacherProfile, setLoadingTeacherProfile] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the speaker profile to get the speaker ID
      const speakerResponse = await getData('speaker/profile');
      if (speakerResponse.error) {
        throw new Error('Failed to load speaker profile');
      }
      
      const speakerId = speakerResponse.data._id;
      
      // Then get requests for this speaker
      const requestsResponse = await getData(`request/speaker/${speakerId}`);
      if (requestsResponse.error) {
        throw new Error('Failed to load requests');
      }
      
      setRequests(requestsResponse.data || []);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (request: SpeakerRequest) => {
    setSelectedRequest(request);
    setOpen(true);
    // Debug: Print teacherId and its fields
    console.log('TeacherId:', request.teacherId);
    if (request.teacherId && request.teacherId._id) {
      setLoadingTeacherProfile(true);
      try {
        const response = await getData(`teacher/${request.teacherId._id}`);
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
  };

  const handleCloseError = () => setError(null);

  const toggleTeacherDetails = (requestId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setExpandedTeachers((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
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

  // Group requests by status
  const groupedRequests = requests.reduce((acc, request) => {
    const status = request.status.toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {} as { [key: string]: SpeakerRequest[] });

  const statusOrder = [
    'pending review',
    'pending speaker confirmation',
    'approved',
    'archived',
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            marginTop: '64px',
          }}
        >
          <CircularProgress sx={{ color: COLORS.primaryBlue }} />
        </Box>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <Box
        sx={{
          padding: 4,
          flexGrow: 1,
          backgroundColor: COLORS.background,
          marginTop: '64px',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: COLORS.primaryDark,
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          Speaking Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={handleCloseError}>
            {error}
          </Alert>
        )}

        {statusOrder.map((status) => {
          const requestsInStatus = groupedRequests[status] || [];
          if (requestsInStatus.length === 0) return null;

          // Special handling for archived section
          if (status === 'archived') {
            return (
              <Box key={status} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: COLORS.primaryDark,
                      fontWeight: 600,
                      borderBottom: `2px solid ${COLORS.primaryBlue}`,
                      pb: 1,
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Button
                    onClick={() => setShowArchived(!showArchived)}
                    endIcon={showArchived ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    {showArchived ? 'Hide' : 'Show'} Archived
                  </Button>
                </Box>
                <Collapse in={showArchived}>
                  <Grid container spacing={3}>
                    {requestsInStatus.map((request) => (
                      <Grid item xs={12} md={6} lg={4} key={request._id}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: 2,
                            backgroundColor: COLORS.white,
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleCardClick(request)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                              {request.eventName}
                            </Typography>
                            <Chip
                              label={request.status}
                              size="small"
                              color={getStatusColor(request.status) as any}
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                            Requested by: {request.teacherId.firstName} {request.teacherId.lastName}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            {request.teacherId.email}
                          </Typography>

                          {/* Additional Teacher Information */}
                          {(request.teacherId.school || request.teacherId.gradeLevel) && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {request.teacherId.school && `${request.teacherId.school}`}
                              {request.teacherId.school && request.teacherId.gradeLevel && ' • '}
                              {request.teacherId.gradeLevel && `Grade ${request.teacherId.gradeLevel}`}
                            </Typography>
                          )}

                          {(request.teacherId.city || request.teacherId.state) && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              📍 {[request.teacherId.city, request.teacherId.state].filter(Boolean).join(', ')}
                            </Typography>
                          )}

                          {request.teacherId.subjects && request.teacherId.subjects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Subjects: {request.teacherId.subjects.slice(0, 3).join(', ')}
                                {request.teacherId.subjects.length > 3 && ` +${request.teacherId.subjects.length - 3} more`}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {request.isInPerson && (
                              <Chip
                                icon={<PersonIcon />}
                                label="In-person"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {request.isVirtual && (
                              <Chip
                                icon={<VideocamIcon />}
                                label="Virtual"
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>

                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Date:</strong> {formatDateTime(request.dateTime, request.timezone)}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Students:</strong> {request.estimatedStudents} ({request.gradeLevels.join(', ')})
                          </Typography>
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {request.eventPurpose.substring(0, 100)}
                            {request.eventPurpose.length > 100 ? '...' : ''}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            );
          }

          return (
            <Box key={status} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: COLORS.primaryDark,
                  fontWeight: 600,
                  mb: 2,
                  borderBottom: `2px solid ${COLORS.primaryBlue}`,
                  pb: 1,
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
              </Typography>
              <Grid container spacing={3}>
                {requestsInStatus.map((request) => (
                  <Grid item xs={12} md={6} lg={4} key={request._id}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: COLORS.white,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleCardClick(request)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                          {request.eventName}
                        </Typography>
                        <Chip
                          label={request.status}
                          size="small"
                          color={getStatusColor(request.status) as any}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                        Requested by: {request.teacherId.firstName} {request.teacherId.lastName}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {request.teacherId.email}
                      </Typography>

                      {/* Additional Teacher Information */}
                      {(request.teacherId.school || request.teacherId.gradeLevel) && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {request.teacherId.school && `${request.teacherId.school}`}
                          {request.teacherId.school && request.teacherId.gradeLevel && ' • '}
                          {request.teacherId.gradeLevel && `Grade ${request.teacherId.gradeLevel}`}
                        </Typography>
                      )}

                      {(request.teacherId.city || request.teacherId.state) && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          📍 {[request.teacherId.city, request.teacherId.state].filter(Boolean).join(', ')}
                        </Typography>
                      )}

                      {request.teacherId.subjects && request.teacherId.subjects.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Subjects: {request.teacherId.subjects.slice(0, 3).join(', ')}
                            {request.teacherId.subjects.length > 3 && ` +${request.teacherId.subjects.length - 3} more`}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {request.isInPerson && (
                          <Chip
                            icon={<PersonIcon />}
                            label="In-person"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {request.isVirtual && (
                          <Chip
                            icon={<VideocamIcon />}
                            label="Virtual"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Date:</strong> {formatDateTime(request.dateTime, request.timezone)}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Students:</strong> {request.estimatedStudents} ({request.gradeLevels.join(', ')})
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {request.eventPurpose.substring(0, 100)}
                        {request.eventPurpose.length > 100 ? '...' : ''}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}

        {requests.length === 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: COLORS.white,
            }}
          >
            <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2 }}>
              No Speaking Requests Yet
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Educators can request your participation in their classrooms. 
              Your requests will appear here once teachers submit them.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Request Details Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                pb: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Request Details
              </Typography>
              <IconButton onClick={handleClose} size="large">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Teacher Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Teacher Information
                  </Typography>
                  <Paper sx={{ p: 3, backgroundColor: COLORS.lightGray }}>
                    <Grid container spacing={2}>
                      {/* Basic Info */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ color: COLORS.primaryBlue, fontWeight: 600, mb: 1, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                          {selectedRequest.teacherId.firstName} {selectedRequest.teacherId.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ mr: 1, color: '#7f8c8d', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                            {selectedRequest.teacherId.email}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* School Info */}
                      {(teacherProfile.school || teacherProfile.gradeLevel) && (
                        <Grid item xs={12} md={6}>
                          {teacherProfile.school && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                                School
                              </Typography>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                                {teacherProfile.school}
                              </Typography>
                            </Box>
                          )}
                          {teacherProfile.gradeLevel && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                                Grade Level
                              </Typography>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                                {teacherProfile.gradeLevel}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      )}

                      {/* Location */}
                      {(teacherProfile.city || teacherProfile.state) && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                            {[teacherProfile.city, teacherProfile.state].filter(Boolean).join(', ')}
                          </Typography>
                        </Grid>
                      )}

                      {/* Subjects Taught */}
                      {teacherProfile.subjects && teacherProfile.subjects.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                            Subjects Taught
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
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
                        </Grid>
                      )}

                      {/* Bio */}
                      {teacherProfile.bio && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                            About the Teacher
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                            {teacherProfile.bio}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Event Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Event Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Event Name
                      </Typography>
                      <Typography variant="body1">{selectedRequest.eventName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(selectedRequest.dateTime, selectedRequest.timezone)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Purpose
                      </Typography>
                      <Typography variant="body1">{selectedRequest.eventPurpose}</Typography>
                    </Grid>
                    {selectedRequest.additionalInfo && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Additional Information
                        </Typography>
                        <Typography variant="body1">{selectedRequest.additionalInfo}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Audience Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Audience Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Grade Levels
                      </Typography>
                      <Typography variant="body1">{selectedRequest.gradeLevels.join(', ')}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Subjects
                      </Typography>
                      <Typography variant="body1">{selectedRequest.subjects.join(', ')}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Estimated Students
                      </Typography>
                      <Typography variant="body1">{selectedRequest.estimatedStudents}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Speaker Preferences */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Speaker Preferences
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Expertise Needed
                      </Typography>
                      <Typography variant="body1">{selectedRequest.expertise}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Preferred Language
                      </Typography>
                      <Typography variant="body1">{selectedRequest.preferredLanguage}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Location
                      </Typography>
                      <Typography variant="body1">{selectedRequest.location}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Engagement Format
                      </Typography>
                      <Typography variant="body1">{selectedRequest.engagementFormat}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Goals
                      </Typography>
                      <Typography variant="body1">{selectedRequest.goals}</Typography>
                    </Grid>
                    {selectedRequest.budget && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Budget
                        </Typography>
                        <Typography variant="body1">{selectedRequest.budget}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Format */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Format
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedRequest.isInPerson && (
                      <Chip
                        icon={<PersonIcon />}
                        label="In-person"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {selectedRequest.isVirtual && (
                      <Chip
                        icon={<VideocamIcon />}
                        label="Virtual"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Grid>

                {/* Status */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: COLORS.primaryDark, mb: 2, fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Chip
                    label={selectedRequest.status}
                    color={getStatusColor(selectedRequest.status) as any}
                    size="medium"
                  />
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
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
    </div>
  );
}

export default SpeakerRequestsPage; 