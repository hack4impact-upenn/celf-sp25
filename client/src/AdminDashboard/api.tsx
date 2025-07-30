/**
 * A file containing all the api calls for the admin dashboard.
 */
import { deleteData } from '../util/api.tsx';

/**
 * Sends a request to the server to delete a user
 * @param email - the email of the user to delete
 * @returns true if successful, false otherwise
 */
async function deleteUser(email: string) {
  const res = await deleteData(`admin/${email}`);
  if (res.error) return false;
  return true;
}

export { deleteUser };
