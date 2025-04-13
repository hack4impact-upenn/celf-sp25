import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import { IUser, ITeacher, ISpeaker } from '../util/types/user.ts';
import { useData, getData } from '../util/api.tsx';
import AdminSidebar from '../components/admin_sidebar/AdminSidebar';
import TopBar from '../components/top_bar/TopBar';
import { Button, Avatar, TextField, Typography, Divider, Box, CircularProgress, Alert } from '@mui/material';

function ProfilePage() {
  const self = useAppSelector(selectUser);
  const [currUser, setCurrUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakerData, setSpeakerData] = useState<ISpeaker | null>(null);
  const [teacherData, setTeacherData] = useState<ITeacher | null>(null);

  const users = useData('admin/all');

  useEffect(() => {
    const matchedUser = users?.data.find(
      (entry: IUser) => entry?.email === self.email
    );
    setCurrUser(matchedUser);

    if (matchedUser) {
      getUserInfo(matchedUser);
    }
  }, [users, self]);

  const getUserInfo = (matchedUser: IUser) => {
    if (!matchedUser) return;

    const fetchRoleData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (matchedUser.role === 'speaker') {
          const response = await getData(`speaker/${matchedUser._id}`);
          setSpeakerData(response.data);
        } else if (matchedUser.role === 'teacher') {
          const response = await getData(`teacher/${matchedUser._id}`);
          setTeacherData(response.data);
        }
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  };

  if (loading) {
    return (
      <Box mt={8} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={8} display="flex" justifyContent="center">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return  (
    <div className="flex">
      <TopBar />
      <AdminSidebar />
      <div className="main-window p-8 bg-[#f3f4f6] min-h-screen w-full">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md p-8">
          {/* Profile Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Avatar
                src=""
                alt={currUser?.firstName}
                sx={{ width: 64, height: 64 }}
              />
              <div>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {currUser?.firstName} {currUser?.lastName}
                </Typography>
                <Typography sx={{ color: '#6b7280' }}>{currUser?.email}</Typography>
              </div>
            </div>
            <Button variant="contained" sx={{ borderRadius: '999px', textTransform: 'none' }}>
              Edit
            </Button>
          </div>

          <Divider sx={{ mb: 4 }} />

          {/* Grid Layout Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TextField
              label="Full Name"
              value={`${currUser?.firstName || ''} ${currUser?.lastName || ''}`}
              fullWidth
              disabled
            />
            <TextField
              label="Role"
              value={currUser?.role?.charAt(0).toUpperCase() + currUser?.role?.slice(1) || ''}
              fullWidth
              disabled
            />
            <TextField
              label="Location"
              value={speakerData?.location || teacherData?.location || 'N/A'}
              fullWidth
              disabled
            />
            <TextField
              label="Industry Focus"
              value={speakerData?.industryFocus?.join(', ') || 'N/A'}
              fullWidth
              disabled
            />
            <TextField
              label="Languages"
              value={speakerData?.languages?.join(', ') || 'N/A'}
              fullWidth
              disabled
            />
          </div>

          {/* Bio Section */}
          <div>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Bio
            </Typography>
            <div className="bg-[#f9fafb] p-4 rounded-lg border text-gray-700">
              {speakerData?.bio || 'No bio provided.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
