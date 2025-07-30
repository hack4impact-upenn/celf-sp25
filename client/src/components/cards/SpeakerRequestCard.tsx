import {
  CardContent,
  CardMedia,
  Typography,
  Card as MuiCard,
  Chip,
  Box,
} from '@mui/material';
import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import { getData } from '../../util/api.tsx';

// Export this constant so it can be imported elsewhere
export const DEFAULT_IMAGE = '/defaultprofile.jpg';

interface Speaker {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: string;
  bio: string;
  city: string;
  state: string;
  country?: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
  industry: string[];
  grades: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages: string[];
  jobTitle?: string;
}

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

interface Request {
  id: string;
  speaker: Speaker;
  teacher?: Teacher;
  status: string;
}

function SpeakerRequestCard({ id, speaker, teacher, status }: Request) {
  const [teacherProfile, setTeacherProfile] = React.useState<Teacher | null>(null);
  const [loadingTeacher, setLoadingTeacher] = React.useState(false);

  React.useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (teacher?._id) {
        setLoadingTeacher(true);
        try {
          const response = await getData(`teacher/${teacher._id}`);
          if (response.data) {
            setTeacherProfile(response.data);
          }
        } catch (error) {
          console.error('Error fetching teacher profile:', error);
        } finally {
          setLoadingTeacher(false);
        }
      }
    };

    fetchTeacherProfile();
  }, [teacher?._id]);

  console.log('SpeakerRequestCard - teacher data:', teacher);
  console.log('SpeakerRequestCard - teacher profile:', teacherProfile);
  
  const speakerName =
    speaker?.userId?.firstName && speaker?.userId?.lastName
      ? `${speaker.userId.firstName} ${speaker.userId.lastName}`
      : 'Unknown Speaker';

  const teacherName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : 'Unknown Teacher';

  const teacherEmail = teacher
    ? teacher.email
    : 'Unknown Email';

  const teacherId = teacher 
  ? teacher._id
  : 'Unknown Id';

  const organization = speaker?.organization || 'Unknown Organization';
  const locationDisplay = speaker 
    ? [speaker.city, speaker.state, speaker.country].filter(Boolean).join(', ')
    : 'Unknown Location';
  const jobTitle = speaker?.jobTitle || '';
  const imageUrl = speaker?.imageUrl || DEFAULT_IMAGE;
  const bio = speaker?.bio || 'Speaker bio not available';

  return (
    <MuiCard
      sx={{
        width: 270,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
          transform: 'scale(1.02)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardMedia
        sx={{
          height: 200,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          objectFit: 'cover',
        }}
        image={imageUrl}
        title={speakerName}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = DEFAULT_IMAGE;
          target.onerror = null;
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2, pt: 3 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          {speakerName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
          {organization}
          {jobTitle && jobTitle.trim() !== '' && ` • ${jobTitle}`}
          {` • ${locationDisplay}`}
        </Typography>

        {/* Teacher information (always show) */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
            mb: 0.5, 
            fontSize: '0.875rem',
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          Requested by: {teacherName}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
            mb: 1, 
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}
        >
          {teacherEmail}
        </Typography>

        {/* Format chips */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          {speaker?.inperson && (
            <Chip
              icon={<PersonIcon />}
              label="In-person"
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {speaker?.virtual && (
            <Chip
              icon={<VideocamIcon />}
              label="Virtual"
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>

        {/* Status chip */}
        <Chip
          label={status}
          size="small"
          color={
            status === 'Approved'
              ? 'success'
              : status === 'Pending Review'
              ? 'warning'
              : status === 'Pending Speaker Confirmation'
              ? 'info'
              : 'default'
          }
          sx={{ mb: 1 }}
        />

        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
          {bio.length > 100 ? `${bio.substring(0, 100)}...` : bio}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}

export default SpeakerRequestCard;
