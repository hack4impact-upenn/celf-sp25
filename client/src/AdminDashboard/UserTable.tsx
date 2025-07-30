/**
 * A file that contains all the components and logic for the table of users
 * in the AdminDashboardPage.
 */
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { PaginationTable, TColumn } from '../components/PaginationTable.tsx';
import DeleteUserButton from './DeleteUserButton.tsx';
import PromoteUserButton from './PromoteUserButton.tsx';
import { useData } from '../util/api.tsx';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import { IUser } from '../util/types/user.ts';
import Chip from '@mui/material/Chip';

interface AdminDashboardRow {
  key: string;
  first: string;
  last: string;
  email: string;
  userType: React.ReactNode;
  status?: React.ReactNode;
  promote: React.ReactElement;
  remove: React.ReactElement;
}

/**
 * The standalone table component for holding information about the users in
 * the database and allowing admins to remove users and promote users to admins.
 */
function UserTable() {
  // define columns for the table
  const columns: TColumn[] = [
    { id: 'first', label: 'First Name' },
    { id: 'last', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'userType', label: 'User Type' },
    { id: 'status', label: 'Status' },
    { id: 'promote', label: 'Promote to Admin' },
    { id: 'remove', label: 'Remove User' },
  ];

  // Used to create the data type to create a row in the table
  function createAdminDashboardRow(
    user: IUser,
    promote: React.ReactElement,
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
    }

    return {
      key: _id,
      first: firstName,
      last: lastName,
      email,
      userType: <Chip label={label} color={color} size="small" sx={{ fontWeight: 600, fontSize: '0.95em', borderRadius: '8px' }} />,
      status: statusChip,
      promote,
      remove,
    };
  }

  const [userList, setUserList] = useState<IUser[]>([]);
  const users = useData('admin/all');
  const self = useAppSelector(selectUser);

  // Upon getting the list of users for the database, set the state of the userList to contain all users except for logged in user
  useEffect(() => {
    setUserList(
      users?.data.filter(
        (entry: IUser) => entry && entry.email && entry.email !== self.email,
      ),
    );
  }, [users, self]);

  // update state of userlist to remove a user from  the frontend representation of the data
  const removeUser = (user: IUser) => {
    setUserList(
      userList.filter(
        (entry: IUser) => entry && entry.email && entry.email !== user.email,
      ),
    );
  };
  // update state of userlist to promote a user on the frontend representation
  const updateAdmin = (email: string) => {
    setUserList(
      userList.map((entry) => {
        if (entry.email !== email) {
          return entry;
        }
        const newEntry = entry;
        newEntry.admin = true;
        return newEntry;
      }),
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
          <PromoteUserButton
            admin={user.admin}
            email={user.email}
            updateAdmin={updateAdmin}
          />,
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
