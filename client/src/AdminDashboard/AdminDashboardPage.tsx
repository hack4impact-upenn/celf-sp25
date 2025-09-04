import React from 'react';
import { styled } from '@mui/system';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import './AdminDashboard.css';
import { Typography, Grid, Box } from '@mui/material';
import ScreenGrid from '../components/ScreenGrid';
import UserTable from './UserTable';
import InviteAdminButton from '../components/buttons/InviteAdminButton';

function AdminDashboardPage() {
  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />

      <div className="main-window">
        {/* The parent Grid has a custom class for width & centering */}
        <Grid container direction="column" spacing={2} className="admin-grid">
          <Grid item>
            <Typography variant="h2" align="center">
              Welcome to the Admin Dashboard
            </Typography>
          </Grid>

          <Grid item>
            {/* "table-container" class for sizing & optional centering */}
            <div className="table-container">
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <InviteAdminButton />
              </Box>
              <UserTable />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
