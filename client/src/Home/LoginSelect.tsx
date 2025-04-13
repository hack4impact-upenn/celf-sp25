import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import COLORS from '../assets/colors.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';

const ItemButton = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.primaryBlue,
  width: '100%',
  height: 100,
  borderRadius: '12px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  color: COLORS.white,
  cursor: 'pointer',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
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
            padding: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: 600,
            background: COLORS.white,
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
              <Grid container spacing={2} sx={{ width: '100%', px: 0 }}>
                <Grid xs={12}>
                  <ItemButton onClick={() => handleClick('Teacher')}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Teacher
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Register as a teacher to create and manage classes
                    </Typography>
                  </ItemButton>
                </Grid>
                <Grid xs={12}>
                  <ItemButton onClick={() => handleClick('Speaker')}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Speaker
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Register as a speaker to share your expertise
                    </Typography>
                  </ItemButton>
                </Grid>
                <Grid xs={12}>
                  <ItemButton onClick={() => handleClick('Admin')}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Admin
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Register as an administrator
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
