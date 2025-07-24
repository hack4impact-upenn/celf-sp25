/**
 * API functions for admin request management
 */
import { getData, putData } from '../util/api.tsx';

export type RequestStatus =
  | 'Pending Review'
  | 'Pending Speaker Confirmation'
  | 'Approved'
  | 'Archived';

export interface Speaker {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: string;
  bio: string;
  location: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
  industry: string[];
  grades: string[];
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages: string[];
}

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Request {
  _id: string;
  speakerId: Speaker;
  teacherId: Teacher;
  speaker?: Speaker; // For frontend compatibility
  teacher?: Teacher; // For frontend compatibility
  status: RequestStatus;
  
  // Audience Information
  gradeLevels: string[];
  subjects: string[];
  estimatedStudents: number;
  
  // Event Details
  eventName: string;
  eventPurpose: string;
  dateTime: string;
  timezone: string;
  isInPerson: boolean;
  isVirtual: boolean;
  additionalInfo?: string;
  
  // Speaker Preferences
  expertise: string;
  preferredLanguage: string;
  location: string;
  goals: string;
  budget?: string;
  engagementFormat: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches all requests from the server
 * @returns Promise<Request[]> - Array of all requests
 */
export async function getAllRequests(): Promise<Request[]> {
  try {
    const response = await getData('request/all');
    if (response.error) {
      throw new Error(response.error);
    }
    console.log('Raw API response:', response.data);
    // Map teacherId.userId to teacher for frontend compatibility
    const mappedRequests = (response.data || []).map((req: any) => {
      console.log('Mapping request:', req);
      console.log('TeacherId in request:', req.teacherId);
      const mapped = {
        ...req,
        teacherId: req.teacherId, // keep the original
        teacher: req.teacherId
          ? {
              _id: req.teacherId._id,
              firstName: req.teacherId.firstName,
              lastName: req.teacherId.lastName,
              email: req.teacherId.email,
            }
          : undefined,
        speaker: req.speakerId,
      };
      console.log('Mapped request:', mapped);
      return mapped;
    });
    return mappedRequests;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
}

/**
 * Updates the status of a specific request
 * @param requestId - The ID of the request to update
 * @param status - The new status to set
 * @returns Promise<Request> - The updated request
 */
export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<Request> {
  try {
    const response = await putData(`request/${requestId}/status`, { status });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
} 