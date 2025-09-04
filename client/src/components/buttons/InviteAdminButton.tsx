import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import useAlert from '../../util/hooks/useAlert';
import AlertType from '../../util/types/alert';
import { postData } from '../../util/api';

function InviteAdminButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAlert } = useAlert();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setError('');
  };

  const handleInvite = async () => {
    setLoading(true);
    setError('');
    postData('admin/invite-admin', { email, firstName, lastName }).then((res) => {
      if (res.error) {
        setError(res.error.message);
      } else {
        setAlert(`${email} successfully invited as admin!`, AlertType.SUCCESS);
        setOpen(false);
      }
      setLoading(false);
    });
  };

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handleClickOpen}>
        Invite Admin
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Enter the new admin's email, first name, and last name. They will receive an invite link to set their password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            variant="standard"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            variant="standard"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <DialogContentText sx={{ color: 'red' }}>{error}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleInvite}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InviteAdminButton; 