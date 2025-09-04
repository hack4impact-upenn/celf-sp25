/**
 * API functions for teacher request management
 */
import { getData, postData, putData } from '../util/api';

export type RequestStatus = 'Pending Review' | 'Pending Speaker Confirmation' | 'Approved' | 'Archived';

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
  country?: string;
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

export interface TeacherRequest {
  _id: string;
  speakerId: Speaker;
  teacherId: Teacher;
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
  city: string;
  state: string;
  country?: string;
  goals: string;
  budget?: string;
  engagementFormat: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all requests for the current teacher
 * @returns Promise<TeacherRequest[]> - Array of teacher requests
 */
export async function getTeacherRequests(): Promise<TeacherRequest[]> {
  try {
    const response = await getData('request/current');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    throw error;
  }
}

/**
 * Creates a new request for a speaker
 * @param speakerId - The ID of the speaker to request
 * @param requestData - The request details
 * @returns Promise<TeacherRequest> - The created request
 */
export async function createTeacherRequest(
  speakerId: string,
  requestData: {
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
    
    // Speaker Preferences
    expertise: string;
    preferredLanguage: string;
    city: string;
    state: string;
    country?: string;
    goals: string;
    budget?: string;
    engagementFormat: string;
  }
): Promise<TeacherRequest> {
  try {
    const response = await postData('request', {
      speakerId,
      ...requestData,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error('Error creating teacher request:', error);
    throw error;
  }
}

/**
 * Updates the status of a teacher request
 * @param requestId - The ID of the request to update
 * @param status - The new status for the request
 * @returns Promise<TeacherRequest> - The updated request
 */
export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<TeacherRequest> {
  try {
    const response = await putData(`request/${requestId}/status/own`, { status });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
} 