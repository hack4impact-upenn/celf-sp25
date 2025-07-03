import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box, Typography } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';
import { SxProps, Theme } from '@mui/material/styles';
import COLORS from '../assets/colors';
import { useAppSelector, useAppDispatch } from '../util/redux/hooks.ts';
import { selectUser, logout as logoutAction } from '../util/redux/userSlice.ts';
import { logout as logoutApi } from '../Home/api.tsx';

interface ProfileDropDownProps {
  sx?: SxProps<Theme>;
}

function ProfileDropDown({ sx }: ProfileDropDownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const success = await logoutApi();
      if (success) {
        dispatch(logoutAction());
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    handleClose();
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  };

  const handleAccountSettingsClick = () => {
    handleClose();
    navigate('/account-settings');
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: COLORS.lightGray,
          borderRadius: '5px',
          padding: '10px 12px',
          border: 2,
          borderColor: COLORS.primaryDark,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: COLORS.lightGray,
            opacity: 0.9,
          },
        }}
        onClick={handleMenu}
      >
        <AccountCircle sx={{ ...sx, marginRight: '4px' }} />
        <Typography sx={{ color: 'black', fontSize: '14px' }}>
          {`${user.firstName} ${user.lastName}`}
        </Typography>
      </Box>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {!user.admin && (
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              '&:hover': {
                backgroundColor: COLORS.lightGray,
              },
            }}
          >
            Profile
          </MenuItem>
        )}
        <MenuItem
          onClick={handleAccountSettingsClick}
          sx={{
            '&:hover': {
              backgroundColor: COLORS.lightGray,
            },
          }}
        >
          Account Settings
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: COLORS.lightGray,
            },
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

export default ProfileDropDown;
