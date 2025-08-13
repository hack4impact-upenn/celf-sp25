import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import COLORS from '../assets/colors.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';

const ItemButton = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  width: '100%',
  minHeight: 120,
  borderRadius: '18px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(3, 3),
  color: COLORS.primaryDark,
  cursor: 'pointer',
  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.10)',
  fontSize: '1.1rem',
  marginBottom: theme.spacing(1.5),

  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.16)',
    backgroundColor: COLORS.primaryBlue,
    color: COLORS.white,
  },
}));

function LoginSelectPage() {
  const navigate = useNavigate();
  const handleClick = (role: string) => {
    if (role === 'Teacher') {
      navigate('/teacher-register');
    } else if (role === 'Speaker') {
      navigate('/speaker-register');
    }
  };

  return (
    <ScreenGrid>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 4 },
            borderRadius: 4,
            width: '100%',
            maxWidth: 500,
            background: COLORS.white,
            boxShadow: '0 8px 32px rgba(44, 62, 80, 0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Grid container direction="column" alignItems="center" spacing={3}>
              <Grid sx={{ mb: 1 }}>
                <Box
                  component="img"
                  src="/images/celf-logo.png"
                  alt="CELF Logo"
                  sx={{
                    height: 100,
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Grid>
              <Grid>
                <Typography
                  variant="h4"
                  textAlign="center"
                  sx={{
                    color: COLORS.primaryDark,
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Create Account
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ 
                    color: COLORS.gray,
                    mb: 2
                  }}
                >
                  Select your role to get started
                </Typography>
              </Grid>
              <Grid container direction="column" alignItems="center" sx={{ width: '100%', mt: 1 }}>
                <Grid xs={12} sx={{ width: '100%', mb: 1.5 }}>
                  <ItemButton onClick={() => handleClick('Teacher')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.3rem', mb: 1 }}>
                      Teacher
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.4 }}>
                      Register as a teacher to view and request speakers
                    </Typography>
                  </ItemButton>
                </Grid>
                <Grid xs={12} sx={{ width: '100%' }}>
                  <ItemButton onClick={() => handleClick('Speaker')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.3rem', mb: 1 }}>
                      Speaker
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.4 }}>
                      Register as a speaker to share your expertise
                    </Typography>
                  </ItemButton>
                </Grid>
              </Grid>
              <Grid>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: COLORS.primaryBlue,
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Back to Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </ScreenGrid>
  );
}

export default LoginSelectPage;
