import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar.tsx';
import TopBar from '../components/top_bar/TopBar.tsx';
import './AdminDashboard.css';
import { 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  Button, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio,
  Alert,
  CircularProgress
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { exportSpeakersData } from './api.tsx';

const ExportButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 200,
  height: 48,
  fontSize: '1rem',
  textTransform: 'none',
}));

function AdminExportSpeakersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [lastDownloadTime, setLastDownloadTime] = useState<string | null>(() => {
    return localStorage.getItem('lastSpeakerExportTime');
  });

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await exportSpeakersData();
      if (result.success) {
        const now = new Date().toLocaleString();
        setLastDownloadTime(now);
        localStorage.setItem('lastSpeakerExportTime', now);
        setMessage({ 
          type: 'success', 
          text: `Successfully exported ${result.count} speakers to CSV` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to export speakers data' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while exporting data' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />

      <div className="main-window">
        <Grid container direction="column" spacing={3} className="admin-grid">
          <Grid item>
            <Typography variant="h2" align="center">
              Export Speaker Data
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
              Download speaker information as CSV files
            </Typography>
          </Grid>

          <Grid item>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Export All Speakers
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Download the complete speaker database including all profiles and information.
                </Typography>
                
                {lastDownloadTime && (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontStyle: 'italic',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    padding: 1,
                    borderRadius: 1
                  }}>
                    Last downloaded: {lastDownloadTime}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ExportButton
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Download />}
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  {isLoading ? 'Exporting...' : 'Export to CSV'}
                </ExportButton>
              </Box>

              {message && (
                <Alert 
                  severity={message.type} 
                  sx={{ mt: 2 }}
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}


            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default AdminExportSpeakersPage; 