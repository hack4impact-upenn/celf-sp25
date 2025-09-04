/**
 * A file that contains all the components and logic for the table of users
 * in the AdminDashboardPage.
 */
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { PaginationTable, TColumn } from '../components/PaginationTable';
import DeleteUserButton from './DeleteUserButton';
import { useData } from '../util/api';
import { useAppSelector } from '../util/redux/hooks';
import { selectUser } from '../util/redux/userSlice';
import { IUser } from '../util/types/user';
import Chip from '@mui/material/Chip';

interface AdminDashboardRow {
  key: string;
  first: string;
  last: string;
  email: string;
  userType: React.ReactNode;
  status?: React.ReactNode;
  remove: React.ReactElement;
}

/**
 * The standalone table component for holding information about the users in
 * the database and allowing admins to remove users.
 */
function UserTable() {
  // define columns for the table
  const columns: TColumn[] = [
    { id: 'first', label: 'First Name', sortable: true },
    { id: 'last', label: 'Last Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'userType', label: 'User Type', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'remove', label: 'Remove User', sortable: false },
  ];

  // Used to create the data type to create a row in the table
  function createAdminDashboardRow(
    user: IUser,
    remove: React.ReactElement,
  ): AdminDashboardRow {
    const { _id, firstName, lastName, email, admin, role, speakerVisible, profileComplete } = user;
    let userType = '';
    if (admin) {
      userType = 'admin';
    } else if (role) {
      userType = role;
    } else {
      userType = 'unknown';
    }
    // Capitalize first letter
    const label = userType.charAt(0).toUpperCase() + userType.slice(1);
    // Color code
    let color: 'primary' | 'secondary' | 'success' | 'default' = 'default';
    if (userType === 'admin') color = 'primary';
    else if (userType === 'teacher') color = 'success';
    else if (userType === 'speaker') color = 'secondary';

    // Create status chip for speakers
    let statusChip: React.ReactNode = null;
    if (role === 'speaker' && speakerVisible !== undefined) {
      if (speakerVisible) {
        statusChip = <Chip label="Visible" color="success" size="small" sx={{ fontWeight: 600, fontSize: '0.85em', borderRadius: '8px' }} />;
      } else if (profileComplete) {
        statusChip = <Chip label="Hidden: Complete" color="warning" size="small" sx={{ fontWeight: 600, fontSize: '0.85em', borderRadius: '8px' }} />;
      } else {
        statusChip = <Chip label="Hidden: Incomplete" color="error" size="small" sx={{ fontWeight: 600, fontSize: '0.85em', borderRadius: '8px' }} />;
      }
    } else {
      // For non-speaker users, show N/A to maintain column alignment
      statusChip = <Chip label="N/A" color="default" size="small" sx={{ fontWeight: 600, fontSize: '0.85em', borderRadius: '8px' }} />;
    }

    return {
      key: _id,
      first: firstName,
      last: lastName,
      email,
      userType: <Chip label={label} color={color} size="small" sx={{ fontWeight: 600, fontSize: '0.95em', borderRadius: '8px' }} />,
      status: statusChip,
      remove,
    };
  }

  const [userList, setUserList] = useState<IUser[]>([]);
  const users = useData('admin/all');
  const self = useAppSelector(selectUser);

  // Upon getting the list of users for the database, set the state of the userList to contain all users
  useEffect(() => {
    setUserList(users?.data || []);
  }, [users]);

  // update state of userlist to remove a user from  the frontend representation of the data
  const removeUser = (user: IUser) => {
    setUserList(
      userList.filter(
        (entry: IUser) => entry && entry.email && entry.email !== user.email,
      ),
    );
  };

  // if the userlist is not yet populated, display a loading spinner
  if (!userList) {
    return (
      <div style={{ width: '0', margin: 'auto' }}>
        <CircularProgress size={80} />
      </div>
    );
  }
  return (
    <PaginationTable
      rows={userList.map((user: IUser) =>
        createAdminDashboardRow(
          user,
          <DeleteUserButton
            user={user}
            removeRow={removeUser}
          />,
        ),
      )}
      columns={columns}
    />
  );
}

export default UserTable;
