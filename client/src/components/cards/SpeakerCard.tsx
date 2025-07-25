import {
  Button,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Card as MuiCard,
} from '@mui/material';
import React from 'react';

interface SpeakerCardProps {
  id: string;
  name: string;
  bio: string;
  organization: string;
  city: string;
  state: string;
  country?: string;
  imageUrl?: string;
  children?: React.ReactNode;
}

export const DEFAULT_IMAGE = '/defaultprofile.jpg';

function SpeakerCard({
  id,
  name,
  bio,
  organization,
  city,
  state,
  country,
  imageUrl,
  children,
}: SpeakerCardProps) {
  console.log(city, state, country);
  const locationDisplay = [city, state, country].filter(Boolean).join(', ');

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
        image={imageUrl || DEFAULT_IMAGE}
        title={name}
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
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {organization} • {locationDisplay}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {bio}
        </Typography>
      </CardContent>
      {children && <CardActions sx={{ justifyContent: 'flex-end' }}>{children}</CardActions>}
    </MuiCard>
  );
}

export default SpeakerCard;
