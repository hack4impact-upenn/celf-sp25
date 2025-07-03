import { IRequest } from "../models/request.model.ts";
import Request from "../models/request.model.ts";

/**
 * Get all requests from the database with populated speaker and teacher data
 */
const getAllRequests = async () => {
  const requests = await Request.find()
    .populate({
      path: 'speakerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'teacherId',
      select: 'firstName lastName email'
    })
    .exec();
  return requests;
};

/**
 * Get requests by teacher ID with populated speaker data
 */
const getRequestsByTeacherId = async (teacherId: string) => {
  const requests = await Request.find({ teacherId })
    .populate({
      path: 'speakerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'teacherId',
      select: 'firstName lastName email'
    })
    .exec();
  return requests;
};

/**
 * Get a request by its ID with populated data
 */
const getRequestById = async (requestId: string) => {
  const request = await Request.findById(requestId)
    .populate({
      path: 'speakerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'teacherId',
      select: 'firstName lastName email'
    })
    .exec();
  return request;
};

/**
 * Create a new request
 */
const createRequest = async (
  speakerId: string, 
  teacherId: string,
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
    location: string;
    goals: string;
    budget?: string;
    engagementFormat: string;
  }
) => {
  console.log('Creating request with teacherId:', teacherId);
  
  const newRequest = new Request({
    speakerId,
    teacherId,
    ...requestData,
  });
  const request = await newRequest.save();
  
  console.log('Saved request:', request);
  
  // Populate the created request with related data
  const populatedRequest = await Request.findById(request._id)
    .populate({
      path: 'speakerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'teacherId',
      select: 'firstName lastName email'
    })
    .exec();
    
  console.log('Populated request:', populatedRequest);
  console.log('Teacher data in populated request:', populatedRequest?.teacherId);
    
  return populatedRequest;
};

/**
 * Update a request's status
 */
const updateRequestStatus = async (requestId: string, status: IRequest["status"]) => {
  const request = await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  )
    .populate({
      path: 'speakerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'teacherId',
      select: 'firstName lastName email'
    })
    .exec();
  return request;
};

/**
 * Delete a request
 */
const deleteRequest = async (requestId: string) => {
  const request = await Request.findByIdAndDelete(requestId).exec();
  return request;
};

export {
  getAllRequests,
  getRequestsByTeacherId,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest,
}; 