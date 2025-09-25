import { postData } from '../util/api';

/**
 * Makes a request to the server to logout a user from the current session
 * @returns true if successful, false otherwise
 */
async function logout() {
  const res = await postData('auth/logout');
  if (res.error) return false;
  return true;
}

export { logout };
