import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

// Configure axios to use the correct base URL
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
}

interface UserId {
  _id: string;
}

interface Teacher {
  _id: string;
  userId: string | UserId;
  school: string;
  location: string;
  user?: User;
}

const AdminTeacherPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editForm, setEditForm] = useState({
    school: '',
    location: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    // Filter teachers based on search query
    const filtered = teachers.filter((teacher) => {
      const fullName = `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teacher/all');
      const teachersData = response.data;
      
      // Fetch user information for each teacher
      const teachersWithUserInfo = await Promise.all(
        teachersData.map(async (teacher: Teacher) => {
          try {
            // Access the string value of the userId
            const userId = typeof teacher.userId === 'object' ? teacher.userId._id : teacher.userId;
            const userResponse = await axios.get(`/api/user/${userId}`);
            return { ...teacher, user: userResponse.data };
          } catch (error) {
            console.error(`Error fetching user info for teacher ${teacher._id}:`, error);
            return teacher;
          }
        })
      );
      
      setTeachers(teachersWithUserInfo);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      school: teacher.school,
      location: teacher.location,
      firstName: teacher.user?.firstName || '',
      lastName: teacher.user?.lastName || '',
      email: teacher.user?.email || '',
    });
    setOpenEdit(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpenDelete(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedTeacher(null);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
    setSelectedTeacher(null);
  };

  const handleEditSubmit = async () => {
    if (!selectedTeacher) return;

    try {
      // Get the correct userId string for user updates
      const userId = typeof selectedTeacher.userId === 'object' ? selectedTeacher.userId._id : selectedTeacher.userId;

      // Check if teacher-specific fields have changed
      const teacherFieldsChanged = 
        editForm.school !== selectedTeacher.school || 
        editForm.location !== selectedTeacher.location;

      // Check if user fields have changed
      const userFieldsChanged = 
        editForm.firstName !== selectedTeacher.user?.firstName ||
        editForm.lastName !== selectedTeacher.user?.lastName ||
        editForm.email !== selectedTeacher.user?.email;

      // Only make API calls for fields that have changed
      if (teacherFieldsChanged) {
        await axios.put(`/api/teacher/update/${selectedTeacher._id}`, {
          school: editForm.school,
          location: editForm.location,
        });
      }

      if (userFieldsChanged) {
        await axios.put(`/api/user/update/${userId}`, {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
        });
      }

      fetchTeachers();
      handleEditClose();
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTeacher) return;

    try {
      // Get the correct userId string
      const userId = typeof selectedTeacher.userId === 'object' ? selectedTeacher.userId._id : selectedTeacher.userId;
      
      // Only delete the teacher profile, not the user account
      await axios.delete(`/api/teacher/${userId}`);
      fetchTeachers();
      handleDeleteClose();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teacher Management
      </Typography>
      
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search teachers by name..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </TableCell>
                <TableCell>{teacher.user?.email}</TableCell>
                <TableCell>{teacher.school}</TableCell>
                <TableCell>{teacher.location}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditClick(teacher)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(teacher)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={handleEditClose}>
        <DialogTitle>Edit Teacher Information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            fullWidth
            value={editForm.firstName}
            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={editForm.lastName}
            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="School"
            fullWidth
            value={editForm.school}
            onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this teacher profile? This will only remove the teacher profile and not delete the user account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteSubmit} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeacherPage;
