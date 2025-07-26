import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { deleteUser } from './api.tsx';
import LoadingButton from '../components/buttons/LoadingButton.tsx';
import ConfirmationModal from '../components/ConfirmationModal.tsx';
import AlertType from '../util/types/alert.ts';
import useAlert from '../util/hooks/useAlert.tsx';
import { IUser } from '../util/types/user.ts';

interface DeleteUserButtonProps {
  user: IUser;
  removeRow: (user: IUser) => void;
}

/**
 * The button component which, when clicked, will delete the user from the database.
 * If the user is an admin, the button will be unclickable.
 * @param user - the user object to delete
 * @param removeRow - a function which removes a row from the user table. This
 * function is called upon successfully deletion of user from the database.
 */
function DeleteUserButton({ user, removeRow }: DeleteUserButtonProps) {
  const { setAlert } = useAlert();
  const [isLoading, setLoading] = useState(false);
  
  async function handleDelete() {
    setLoading(true);
    
    try {
      if (user.admin) {
        setAlert('Cannot delete admin users.', AlertType.ERROR);
        setLoading(false);
        return;
      }
      
      const success = await deleteUser(user.email);
      
      if (success) {
        removeRow(user);
        setAlert(`User ${user.email} has been deleted.`, AlertType.SUCCESS);
      } else {
        setAlert(`Failed to delete user ${user.email}.`, AlertType.ERROR);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlert(`Error deleting user ${user.email}.`, AlertType.ERROR);
      setLoading(false);
    }
  }
  
  if (isLoading) {
    return <LoadingButton />;
  }
  
  if (user.admin) {
    return (
      <Button variant="outlined" disabled>
        User is Admin
      </Button>
    );
  }
  
  return (
    <ConfirmationModal
      buttonText="Remove User"
      title="Are you sure you want to remove this user?"
      body="This action is permanent. User information will not be able to be recovered."
      onConfirm={() => handleDelete()}
    />
  );
}

export default DeleteUserButton;
