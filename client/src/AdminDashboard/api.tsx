/**
 * A file containing all the api calls for the admin dashboard.
 */
import { deleteData, putData } from '../util/api.tsx';

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
/**
 * Sends a request to the server to promote a user to admin
 * @param email - the email of the user to promote
 * @returns true if successful, false otherwise
 */
async function upgradePrivilege(email: string) {
  const res = await putData('admin/promote', { email });
  if (res.error) return false;
  return true;
}

/**
 * Deletes a speaker profile
 * @param userId - The ID of the speaker to delete
 * @returns boolean indicating success
 */
export const deleteSpeaker = async (userId: string) => {
  try {
    const response = await deleteData(`speaker/${userId}`);
    return response !== null;
  } catch (error) {
    console.error("Error deleting speaker:", error);
    return false;
  }
};

export { deleteUser, upgradePrivilege };
