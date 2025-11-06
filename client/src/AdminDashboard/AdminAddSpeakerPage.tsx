import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  SelectChangeEvent,
  Input,
  Alert,
  Snackbar,
  CircularProgress,
  Select,
  MenuItem,
  Chip,
  FormControl,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import MultiSelect from './MultiSelect';
import { postData } from '../util/api';
import { getIndustryFocuses, IndustryFocus } from '../util/industryFocusApi';

const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Other'];
const speakingFormatOptions = ['In-Person', 'Virtual'];
const gradeOptions = ['Elementary School', 'Middle School', 'High School'];

interface SpeakerFormState {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  jobTitle: string;
  website: string;
  speakingFormats: string[];
  gradeSpecialties: string[];
  industryFocuses: string[];
  languages: string[];
  picture: string | null;
}

const initialFormState: SpeakerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  bio: '',
  city: '',
  state: '',
  country: '',
  speakingFormats: [],
  jobTitle: '',
  website: '',
  gradeSpecialties: [],
  industryFocuses: [],
  languages: [],
  picture: null,
};

function AdminUsersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] =
    useState<SpeakerFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);
  const [industryFocusError, setIndustryFocusError] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const formHasChanges = useRef(false);
  const isNavigatingAway = useRef(false);

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(formState) !== JSON.stringify(initialFormState);
  };

  // Fetch industry focuses on component mount
  useEffect(() => {
    const fetchIndustryFocuses = async () => {
      try {
        const focuses = await getIndustryFocuses();
        setIndustryFocuses(focuses);
        setIndustryFocusError(null);
      } catch (error) {
        console.error('Failed to fetch industry focuses:', error);
        setIndustryFocusError('Failed to load industry focuses. Please try again later.');
      } finally {
        setLoadingFocuses(false);
      }
    };

    fetchIndustryFocuses();
  }, []);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formState]);

  // Create a safe navigate function that checks for unsaved changes
  const safeNavigate = (path: string) => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(path);
      setShowLeaveDialog(true);
    } else {
      navigate(path);
    }
  };

  // Store the current location to detect changes
  const currentLocationRef = useRef(location.pathname);

  // Intercept navigation attempts via links and buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges()) return;

      const target = e.target as HTMLElement;
      
      // Check for links
      const link = target.closest('a[href]') as HTMLAnchorElement;
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && href !== location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(href);
          setShowLeaveDialog(true);
          return;
        }
      }

      // For sidebar buttons and other programmatic navigation,
      // we'll let the navigation happen and catch it in the location change handler
      // This is because we can't easily determine the target path from the button
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [formState, location.pathname]);

  // Detect location changes and block if needed
  useEffect(() => {
    const newPath = location.pathname;
    const oldPath = currentLocationRef.current;
    
    if (newPath !== oldPath) {
      // Location changed
      if (hasUnsavedChanges() && !isNavigatingAway.current) {
        // Store the intended destination
        const intendedPath = newPath;
        
        // Immediately block the navigation by navigating back
        // Use replace to avoid adding to history
        navigate(oldPath, { replace: true });
        
        // Show the dialog
        setPendingNavigation(intendedPath);
        setShowLeaveDialog(true);
        
        // Don't update currentLocationRef yet - wait for confirmation
      } else {
        // No unsaved changes or intentionally navigating - allow it
        currentLocationRef.current = newPath;
      }
    }
  }, [location.pathname, formState, navigate]);

  // Intercept browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges() && !isNavigatingAway.current) {
        // Push current state back to prevent navigation
        window.history.pushState(null, '', currentLocationRef.current);
        setShowLeaveDialog(true);
        setPendingNavigation(null); // Will use browser back if confirmed
      }
    };

    // Store initial location
    currentLocationRef.current = location.pathname;
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [formState, location.pathname]);

  // Handle component unmount (when navigating away programmatically)
  useEffect(() => {
    return () => {
      // This runs when component unmounts
      // If there are unsaved changes and we're not intentionally navigating away,
      // we can't block it here, but the beforeunload will catch page refreshes
    };
  }, []);

  const handleConfirmLeave = () => {
    isNavigatingAway.current = true;
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      currentLocationRef.current = pendingNavigation;
      navigate(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // Handle browser back/forward
      window.history.back();
    }
    // Reset flag after a short delay to allow navigation to complete
    setTimeout(() => {
      isNavigatingAway.current = false;
    }, 100);
  };

  const handleCancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  };

  // Update text/textarea fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update checkbox selections for speaking formats
  const handleSpeakingFormatChange = (format: string) => {
    setFormState((prev) => ({
      ...prev,
      speakingFormats: prev.speakingFormats.includes(format)
        ? prev.speakingFormats.filter(f => f !== format)
        : [...prev.speakingFormats, format],
    }));
  };

  // Update checkbox selections for grade specialties
  const handleGradeSpecialtyChange = (grade: string) => {
    setFormState((prev) => ({
      ...prev,
      gradeSpecialties: prev.gradeSpecialties.includes(grade)
        ? prev.gradeSpecialties.filter(g => g !== grade)
        : [...prev.gradeSpecialties, grade],
    }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string | string[]>,
    name: string,
  ) => {
    const {
      target: { value },
    } = event;
    setFormState((prev) => ({
      ...prev,
      // On autofill we get a stringified value.
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormState((prev) => ({
          ...prev,
          picture: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formState.industryFocuses || formState.industryFocuses.length === 0) {
      setError('Please select at least one industry focus.');
      setLoading(false);
      return;
    }

    if (!formState.gradeSpecialties || formState.gradeSpecialties.length === 0) {
      setError('Please select at least one age/grade specialty.');
      setLoading(false);
      return;
    }

    if (!formState.speakingFormats || formState.speakingFormats.length === 0) {
      setError('Please select at least one speaking format.');
      setLoading(false);
      return;
    }

    try {
      // Map speaking formats to boolean values
      const inperson = formState.speakingFormats.includes('In-Person');
      const virtual = formState.speakingFormats.includes('Virtual');

      // Create payload for the new admin endpoint
      const speakerPayload = {
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        organization: formState.organization || 'Unknown',
        bio: formState.bio || 'No bio provided',
        city: formState.city || 'Unknown',
        state: formState.state || '',
        country: formState.country || undefined,
        industry: formState.industryFocuses,
        grades: formState.gradeSpecialties,
        languages: formState.languages.length > 0 ? formState.languages : ['English'],
      };

      console.log('Creating speaker with payload:', speakerPayload);
      const speakerResponse = await postData('admin/create-speaker', speakerPayload);
      if (speakerResponse.error) {
        throw new Error(speakerResponse.error.message);
      }
      console.log('Speaker created:', speakerResponse.data);

      // Reset form after successful submission
      setFormState(initialFormState);
      formHasChanges.current = false;
      setSuccess('Speaker created successfully! The speaker account is now visible and a password reset email has been sent to their email address.');
    } catch (error) {
      console.error('Error creating speaker:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while creating the speaker.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />

      {/* Main Content Area */}
      <Box className="main-window">
        <Typography variant="h4" gutterBottom>
          Create Speaker Account
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Create a speaker account that will be immediately visible. A password reset email will be sent to the speaker.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2, // vertical spacing between fields
          }}
        >
          <TextField
            label="First Name"
            name="firstName"
            value={formState.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formState.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Job Title"
            name="jobTitle"
            value={formState.jobTitle}
            onChange={handleChange}
          />
          <TextField
            label="LinkedIn/Website"
            name="website"
            value={formState.website}
            onChange={handleChange}
          />
          <TextField
            label="Organization"
            name="organization"
            value={formState.organization}
            onChange={handleChange}
            required
          />
          <TextField
            label="Bio"
            name="bio"
            multiline
            rows={3}
            variant="outlined"
            value={formState.bio}
            onChange={handleChange}
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              name="city"
              value={formState.city}
              onChange={handleChange}
              sx={{ flex: 1 }}
              required
            />
            <TextField
              label="State"
              name="state"
              value={formState.state}
              onChange={handleChange}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Country"
              name="country"
              value={formState.country}
              onChange={handleChange}
              sx={{ flex: 1 }}
              required
            />
          </Box>
          <MultiSelect
            label="Industry Focus"
            selectOptions={industryFocuses.map(focus => focus.name)}
            handleChange={(e) => handleSelectChange(e, 'industryFocuses')}
            value={formState.industryFocuses}
            loading={loadingFocuses}
            error={industryFocusError}
          />
          <FormControl fullWidth>
            <FormLabel component="legend">Languages</FormLabel>
            <Select
              multiple
              value={formState.languages}
              onChange={(e) => handleSelectChange(e, 'languages')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend" required>
              Preferred Speaking Format
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {speakingFormatOptions.map((format) => (
                <FormControlLabel
                  key={format}
                  control={
                    <Checkbox
                      checked={formState.speakingFormats.includes(format)}
                      onChange={() => handleSpeakingFormatChange(format)}
                    />
                  }
                  label={format}
                />
              ))}
            </Box>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend" required>
              Age/Grade Specialty
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {gradeOptions.map((grade) => (
                <FormControlLabel
                  key={grade}
                  control={
                    <Checkbox
                      checked={formState.gradeSpecialties.includes(grade)}
                      onChange={() => handleGradeSpecialtyChange(grade)}
                    />
                  }
                  label={grade}
                />
              ))}
            </Box>
          </FormControl>
          <Typography variant="subtitle1">Profile Picture</Typography>
          <input type="file" accept="image/*" onChange={handleFileChange} name="picture" />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !!industryFocusError}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Creating Speaker...' : 'Submit'}
          </Button>

          {success && (
            <Alert
              severity="success"
              sx={{ mt: 2 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Leave Confirmation Dialog */}
      <Dialog
        open={showLeaveDialog}
        onClose={handleCancelLeave}
        aria-labelledby="leave-dialog-title"
        aria-describedby="leave-dialog-description"
      >
        <DialogTitle id="leave-dialog-title">
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="leave-dialog-description">
            You have unsaved changes. If you leave this page, all your edits will be lost. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave} color="primary">
            Stay on Page
          </Button>
          <Button onClick={handleConfirmLeave} color="error" variant="contained">
            Leave Page
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminUsersPage;
