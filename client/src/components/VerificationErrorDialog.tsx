import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { resendVerificationEmail } from '../Authentication/api';

interface VerificationErrorDialogProps {
  showAlert: boolean;
  title: string;
  message: string;
  userEmail: string;
  onClose: () => void;
}

function VerificationErrorDialog({ 
  showAlert, 
  title, 
  message, 
  userEmail, 
  onClose 
}: VerificationErrorDialogProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await resendVerificationEmail(userEmail);
      setResendSuccess(true);
    } catch (error: any) {
      setResendError(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setResendSuccess(false);
    setResendError('');
    onClose();
  };

  // Check if this is specifically a verification error
  const isVerificationError = message.toLowerCase().includes('verify') || 
                             message.toLowerCase().includes('verification');

  return (
    <Dialog
      open={showAlert}
      onClose={handleClose}
      aria-labelledby="verification-dialog-title"
      aria-describedby="verification-dialog-description"
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '450px',
          },
        },
      }}
    >
      <DialogTitle id="verification-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="verification-dialog-description" sx={{ mb: 2 }}>
          {message}
        </DialogContentText>
        
        {resendSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Verification email has been sent! Please check your inbox and spam folder.
          </Alert>
        )}
        
        {resendError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {resendError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        {isVerificationError && userEmail && !resendSuccess && (
          <Button 
            onClick={handleResendEmail} 
            disabled={isResending}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            {isResending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : (
              'Resend Email'
            )}
          </Button>
        )}
        <Button onClick={handleClose} variant="contained">
          {resendSuccess ? 'Done' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VerificationErrorDialog; 