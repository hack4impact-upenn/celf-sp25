import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import { getData, postData, putData, deleteData } from '../util/api.tsx';
import COLORS from '../assets/colors.ts';

interface IndustryFocus {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IndustryFocusFormData {
  name: string;
  description: string;
}

function AdminIndustryFocusPage() {
  const [industryFocuses, setIndustryFocuses] = useState<IndustryFocus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFocus, setEditingFocus] = useState<IndustryFocus | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [focusToDelete, setFocusToDelete] = useState<IndustryFocus | null>(null);
  const [affectedSpeakersCount, setAffectedSpeakersCount] = useState<number>(0);
  
  // Form state
  const [formData, setFormData] = useState<IndustryFocusFormData>({
    name: '',
    description: '',
  });

  // Fetch industry focuses
  const fetchIndustryFocuses = async () => {
    try {
      setLoading(true);
      const response = await getData('industry-focus/admin');
      if (response.error) {
        throw new Error(response.error.message);
      }
      setIndustryFocuses(response.data);
    } catch (err) {
      setError('Failed to fetch industry focuses');
      console.error('Error fetching industry focuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustryFocuses();
  }, []);

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open dialog for creating new industry focus
  const handleAddNew = () => {
    setEditingFocus(null);
    setFormData({ name: '', description: '' });
    setDialogOpen(true);
  };

  // Open dialog for editing industry focus
  const handleEdit = (focus: IndustryFocus) => {
    setEditingFocus(focus);
    setFormData({
      name: focus.name,
      description: focus.description || '',
    });
    setDialogOpen(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Industry focus name is required');
        return;
      }

      if (editingFocus) {
        // Update existing
        const response = await putData(`industry-focus/${editingFocus._id}`, formData);
        if (response.error) {
          throw new Error(response.error.message);
        }
        setSuccess('Industry focus updated successfully');
      } else {
        // Create new
        const response = await postData('industry-focus', formData);
        if (response.error) {
          throw new Error(response.error.message);
        }
        setSuccess('Industry focus created successfully');
      }

      setDialogOpen(false);
      fetchIndustryFocuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle delete
  const handleDeleteClick = async (focus: IndustryFocus) => {
    try {
      // Get affected speakers count
      const response = await getData(`industry-focus/${focus._id}/affected-count`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      setAffectedSpeakersCount(response.data.count);
    } catch (err) {
      console.error('Error fetching affected speakers count:', err);
      setAffectedSpeakersCount(0);
    }
    
    setFocusToDelete(focus);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!focusToDelete) return;

    try {
      const response = await deleteData(`industry-focus/${focusToDelete._id}`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      setSuccess(response.data.message || 'Industry focus deleted successfully');
      setDeleteDialogOpen(false);
      setFocusToDelete(null);
      setAffectedSpeakersCount(0);
      fetchIndustryFocuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFocus(null);
    setFormData({ name: '', description: '' });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFocusToDelete(null);
    setAffectedSpeakersCount(0);
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="flex-div">
        <TopBar />
        <AdminSidebar />
        <Box className="main-window">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div className="flex-div">
      <TopBar />
      <AdminSidebar />
      <Box className="main-window">
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: COLORS.primaryDark, fontWeight: 'bold' }}>
              Manage Industry Focuses
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                backgroundColor: COLORS.primaryBlue,
                '&:hover': { backgroundColor: COLORS.primaryDark },
              }}
            >
              Add New Industry Focus
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseAlert}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseAlert}>
              {success}
            </Alert>
          )}

          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: COLORS.lightGray }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {industryFocuses.map((focus) => (
                    <TableRow key={focus._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{focus.name}</TableCell>
                      <TableCell>
                        {focus.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {focus.description}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No description
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(focus)}
                            sx={{ color: COLORS.primaryBlue }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(focus)}
                            sx={{ color: COLORS.accentOrange }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingFocus ? 'Edit Industry Focus' : 'Add New Industry Focus'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description (optional)"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingFocus ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{focusToDelete?.name}"? 
            </Typography>
            <Typography sx={{ mt: 1, color: 'warning.main', fontWeight: 'bold' }}>
              Warning: This will also remove this industry focus from all speakers who have it in their profiles.
            </Typography>
            {affectedSpeakersCount > 0 && (
              <Typography sx={{ mt: 1, color: 'error.main', fontWeight: 'bold' }}>
                This will affect {affectedSpeakersCount} speaker{affectedSpeakersCount !== 1 ? 's' : ''}.
              </Typography>
            )}
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}

export default AdminIndustryFocusPage; 