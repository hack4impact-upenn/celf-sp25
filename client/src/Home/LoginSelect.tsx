import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import COLORS from '../assets/colors.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';

const ItemButton = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.primaryBlue,
  width: '100%',
  minHeight: 110,
  borderRadius: '18px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3, 2),
  color: COLORS.white,
  cursor: 'pointer',
  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.10)',
  fontSize: '1.1rem',
  marginBottom: theme.spacing(2.5),

  '&:hover': {
    transform: 'translateY(-4px) scale(1.03)',
    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.16)',
    backgroundColor: COLORS.primaryDark,
  },
}));

function LoginSelectPage() {
  const navigate = useNavigate();
  const handleClick = (role: string) => {
    if (role === 'Teacher') {
      navigate('/teacher-register');
    } else if (role === 'Speaker') {
      navigate('/speaker-register');
    } else if (role === 'Admin') {
      navigate('/admin-register');
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
              <Grid sx={{ mb: 3 }}>
                <Box
                  component="img"
                  src="/images/celf-logo.png"
                  alt="CELF Logo"
                  sx={{
                    height: 80,
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
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                >
                  Create Account
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: COLORS.gray }}
                >
                  Select your role to get started
                </Typography>
              </Grid>
              <Grid container direction="column" alignItems="center" sx={{ width: '100%', mt: 2 }}>
                <Grid xs={12} sx={{ width: '90%' }}>
                  <ItemButton onClick={() => handleClick('Teacher')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                      Teacher
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                      Register as a teacher to view and request speakers
                    </Typography>
                  </ItemButton>
                </Grid>
                <Grid xs={12} sx={{ width: '90%' }}>
                  <ItemButton onClick={() => handleClick('Speaker')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                      Speaker
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
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
