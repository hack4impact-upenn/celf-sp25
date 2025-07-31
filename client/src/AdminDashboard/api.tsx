/**
 * A file containing all the api calls for the admin dashboard.
 */
import { deleteData, getData, postData } from '../util/api.tsx';

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
 * Exports speaker data to CSV
 * @returns Object with success status, count, and error message if applicable
 */
async function exportSpeakersData() {
  try {
    console.log('Exporting all speakers');
    const res = await postData(`admin/export-speakers`, { exportType: 'all' });
    console.log('Export response:', res);
    
    if (res.error) {
      console.error('Export error:', res.error);
      return { success: false, error: res.error, count: 0 };
    }
    
    // Access the data property from the resolved response
    const responseData = res.data;
    console.log('Response data:', responseData);
    
    // Create and download CSV file
    if (responseData && responseData.csvData) {
      console.log(`CSV data length: ${responseData.csvData.length}`);
      const blob = new Blob([responseData.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speakers_all_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('File download triggered');
    } else {
      console.log('No CSV data in response');
    }
    
    return { success: true, count: responseData?.count || 0, error: null };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: 'Failed to export speakers data', count: 0 };
  }
}

export { deleteUser, exportSpeakersData };
