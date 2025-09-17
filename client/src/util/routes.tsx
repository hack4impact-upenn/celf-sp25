import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useData } from './api';
import { useAppSelector } from './redux/hooks';
import { selectUser } from './redux/userSlice';

interface IDynamicElementProps {
  unAuthPath: string;
  authPath: string;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is not authenticated.
 */
function UnauthenticatedRoutesWrapper() {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? <Navigate to="/" /> : <Outlet />;
}


/**
 * A wrapper component for password reset pages that shows a warning if user is already logged in.
 * This prevents logged-in users from accidentally resetting their password.
 */
function PasswordResetRoutesWrapper() {
  const data = useData('auth/authstatus');
  const user = useAppSelector(selectUser);
  
  if (data === null) return null;
  
  // If user is logged in, show warning message
  if (!data.error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>
          Account Already Logged In
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '600px' }}>
          You are currently logged in as <strong>{user.firstName} {user.lastName}</strong> ({user.email}).
          <br /><br />
          To reset a password for a different account, please <strong>log out first</strong> and then use the password reset link.
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.href = '/logout'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Log Out
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // If user is not logged in, show the password reset form
  return <Outlet />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is  authenticated.
 */
function ProtectedRoutesWrapper() {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? <Outlet /> : <Navigate to="/" />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is an admin.
 */
function AdminRoutesWrapper() {
  const data = useData('admin/adminstatus');
  if (data === null) return null;
  return !data.error ? <Outlet /> : <Navigate to="/" />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is a teacher.
 */
function TeacherRoutesWrapper() {
  const user = useAppSelector(selectUser);
  if (!user || !user.role || user.role.toLowerCase() !== 'teacher') {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is a speaker.
 */
function SpeakerRoutesWrapper() {
  const user = useAppSelector(selectUser);
  if (!user || !user.role || user.role.toLowerCase() !== 'speaker') {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}

/**
 * A wrapper which navigates to a different route depending on if the user is authenticated or not.
 * @param unAuthPath - The path to navigate to if the user is not authenticated. It should be of the form "/path".
 * @param authPath - The path to navigate to if the user is  authenticated. It should be of the form "/path".
 */
function DynamicRedirect({ unAuthPath, authPath }: IDynamicElementProps) {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? (
    <Navigate to={authPath} />
  ) : (
    <Navigate to={unAuthPath} />
  );
}

export {
  UnauthenticatedRoutesWrapper,
  PasswordResetRoutesWrapper,
  ProtectedRoutesWrapper,
  AdminRoutesWrapper,
  TeacherRoutesWrapper,
  SpeakerRoutesWrapper,
  DynamicRedirect,
};
