import {
  CardContent,
  CardMedia,
  Typography,
  Card as MuiCard,
} from '@mui/material';
import React from 'react';

// Export this constant so it can be imported elsewhere
export const DEFAULT_IMAGE = '/defaultprofile.jpg';

interface FakeSpeakerData {
  firstName: string;
  lastName: string;
  bio: string;
  organization: string;
  location: string;
  email: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl: string;
}

type FakeSpeakers = {
  [key: string]: FakeSpeakerData;
};

interface Request {
  id: string;
  speakerid: string;
  status: string;
}

// Updated fake data to match the structure in AdminAllSpeakerPage
const fakeSpeakers: FakeSpeakers = {
  speaker1: {
    firstName: 'Edward',
    lastName: 'Zhang',
    bio: 'Expert in environmental education',
    organization: 'Environmental Education Center',
    location: 'New York, NY',
    email: 'edward@xxx.org',
    inperson: true,
    virtual: false,
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
  },
  speaker2: {
    firstName: 'Khoi',
    lastName: 'Dinh',
    bio: 'Climate change researcher',
    organization: 'Climate Research Institute',
    location: 'Boston, MA',
    email: 'khoi@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
  },
  speaker3: {
    firstName: 'Evelyn',
    lastName: 'Li',
    bio: 'Sustainability consultant',
    organization: 'Sustainability Foundation',
    location: 'San Francisco, CA',
    email: 'evelyn@xxx.org',
    inperson: false,
    virtual: true,
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
  },
  speaker4: {
    firstName: 'Yeon',
    lastName: 'Lee',
    bio: 'Marine biology specialist',
    organization: 'Marine Biology Lab',
    location: 'Seattle, WA',
    email: 'yeon@xxx.org',
    inperson: true,
    virtual: true,
    imageUrl:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  },
  speaker5: {
    firstName: 'Joy',
    lastName: 'Liu',
    bio: 'Renewable energy expert',
    organization: 'Green Energy Institute',
    location: 'Portland, OR',
    email: 'joy@xxx.org',
    inperson: true,
    virtual: false,
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&w=1000&q=80',
  },
};

function SpeakerRequestCard({ id, speakerid, status }: Request) {
  const speakerData = fakeSpeakers[speakerid as keyof FakeSpeakers] || {
    firstName: 'Unknown',
    lastName: '',
    bio: 'Speaker bio not available',
    organization: 'Unknown Organization',
    location: 'Unknown Location',
    email: 'unknown@example.com',
    inperson: false,
    virtual: false,
    imageUrl: DEFAULT_IMAGE,
  };

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
          height: 400,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
        image={speakerData.imageUrl}
        title={`${speakerData.firstName} ${speakerData.lastName}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = DEFAULT_IMAGE;
          target.onerror = null;
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {`${speakerData.firstName} ${speakerData.lastName}`}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {speakerData.organization} • {speakerData.location}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {speakerData.bio}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}

export default SpeakerRequestCard;
