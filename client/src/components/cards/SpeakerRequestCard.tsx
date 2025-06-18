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

interface Request {
  id: string;
  speaker: Speaker;
  status: string;
}

function SpeakerRequestCard({ id, speaker, status }: Request) {
  const speakerName =
    speaker?.userId?.firstName && speaker?.userId?.lastName
      ? `${speaker.userId.firstName} ${speaker.userId.lastName}`
      : 'Unknown Speaker';

  const organization = speaker?.organization || 'Unknown Organization';
  const location = speaker?.location || 'Unknown Location';
  const bio = speaker?.bio || 'Speaker bio not available';
  const imageUrl = speaker?.imageUrl || DEFAULT_IMAGE;

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
        }}
        image={imageUrl}
        title={speakerName}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = DEFAULT_IMAGE;
          target.onerror = null;
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          {speakerName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {organization} • {location}
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
