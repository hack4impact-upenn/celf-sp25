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
  ProtectedRoutesWrapper,
  AdminRoutesWrapper,
  TeacherRoutesWrapper,
  SpeakerRoutesWrapper,
  DynamicRedirect,
};
