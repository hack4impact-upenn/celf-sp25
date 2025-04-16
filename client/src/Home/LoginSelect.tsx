import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import COLORS from '../assets/colors.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';

const ItemButton = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  width: '100%',
  height: '100px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.primaryBlue}`,
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(3),
  color: COLORS.primaryBlue,
  cursor: 'pointer',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',

  '&:hover': {
    backgroundColor: COLORS.primaryBlue,
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '& .description': {
      color: 'white',
    }
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
            padding: 6,
            borderRadius: 4,
            width: '100%',
            maxWidth: 600,
            background: COLORS.white,
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Grid container direction="column" alignItems="center" spacing={4}>
              <Grid sx={{ mb: 2 }}>
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
                    mb: 3
                  }}
                >
                  Select your role to get started
                </Typography>
              </Grid>
              <Box sx={{ 
                width: '100%',
                display: 'flex',
                gap: 3,
                mb: 3
              }}>
                <Box sx={{ flex: 1 }}>
                  <ItemButton onClick={() => handleClick('Teacher')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Teacher
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="description"
                      sx={{ 
                        color: COLORS.gray,
                        fontWeight: 400
                      }}
                    >
                      Register as a teacher to view and request speakers
                    </Typography>
                  </ItemButton>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <ItemButton onClick={() => handleClick('Speaker')}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Speaker
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="description"
                      sx={{ 
                        color: COLORS.gray,
                        fontWeight: 400
                      }}
                    >
                      Register as a speaker to share your expertise
                    </Typography>
                  </ItemButton>
                </Box>
              </Box>
              <Grid sx={{ mt: 2 }}>
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
