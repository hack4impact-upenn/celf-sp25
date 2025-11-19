import express from "express";
import ApiError from "../util/apiError";
import StatusCode from "../util/statusCode";
import { IRequest } from "../models/request.model";
import {
  getAllRequests,
  getRequestsByTeacherId,
  getRequestsBySpeakerId,
  getRequestById,
  createRequest,
  updateRequestStatus,
  updateAdminNotes,
  deleteRequest,
} from "../services/request.service";
import Request from "../models/request.model";

/**
 * Get all requests from the database
 */
const getAllRequestsHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const requests = await getAllRequests();
    res.status(StatusCode.OK).json(requests);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve requests"));
  }
};

/**
 * Get requests by teacher ID
 */
const getRequestsByTeacherIdHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { teacherId } = req.params;
  if (!teacherId) {
    next(ApiError.missingFields(["teacherId"]));
    return;
  }

  try {
    const requests = await getRequestsByTeacherId(teacherId);
    res.status(StatusCode.OK).json(requests);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve requests"));
  }
};

/**
 * Get requests for the current authenticated user
 * Note: adminNotes are excluded for non-admin users
 */
const getCurrentUserRequestsHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const currentUserId = (req.user as any)?._id;
    if (!currentUserId) {
      next(ApiError.unauthorized("User not authenticated"));
      return;
    }

    const requests = await getRequestsByTeacherId(currentUserId);
    res.status(StatusCode.OK).json(requests);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve requests"));
  }
};

/**
 * Get requests by speaker ID
 */
const getRequestsBySpeakerIdHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { speakerId } = req.params;
  if (!speakerId) {
    next(ApiError.missingFields(["speakerId"]));
    return;
  }

  try {
    const requests = await getRequestsBySpeakerId(speakerId);
    res.status(StatusCode.OK).json(requests);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve requests"));
  }
};

/**
 * Get a request by its ID
 */
const getRequestByIdHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { requestId } = req.params;
  if (!requestId) {
    next(ApiError.missingFields(["requestId"]));
    return;
  }

  try {
    const request = await getRequestById(requestId);
    if (!request) {
      next(ApiError.notFound("Request not found"));
      return;
    }
    res.status(StatusCode.OK).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to retrieve request"));
  }
};

/**
 * Create a new request
 */
const createRequestHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { 
    speakerId,
    // Audience Information
    gradeLevels,
    subjects,
    estimatedStudents,
    
    // Event Details
    eventName,
    eventPurpose,
    dateTime,
    timezone,
    isInPerson,
    isVirtual,
    additionalInfo,
    
    // Speaker Preferences
    expertise,
    preferredLanguage,
    city,
    state,
    country,
    goals,
    budget,
    engagementFormat
  } = req.body;
  
  // Get teacherId from the authenticated user session
  const teacherId = (req.user as any)?._id;
  
  console.log('Creating request - teacherId:', teacherId);
  console.log('User from request:', req.user);
  
  if (!speakerId || !teacherId) {
    next(ApiError.missingFields(["speakerId", "teacherId"]));
    return;
  }

  // Validate required fields
  const requiredFields = [
    'gradeLevels', 'subjects', 'estimatedStudents',
    'eventName', 'eventPurpose', 'dateTime', 'timezone',
    'expertise', 'preferredLanguage', 'city', 'state', 'goals', 'engagementFormat'
  ];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    next(ApiError.missingFields(missingFields));
    return;
  }

  // Validate that at least one format is selected
  if (!isInPerson && !isVirtual) {
    next(ApiError.badRequest("At least one format (in-person or virtual) must be selected"));
    return;
  }

  try {
    const requestData = {
      gradeLevels,
      subjects,
      estimatedStudents,
      eventName,
      eventPurpose,
      dateTime,
      timezone,
      isInPerson,
      isVirtual,
      additionalInfo,
      expertise,
      preferredLanguage,
      city,
      state,
      country,
      goals,
      budget,
      engagementFormat
    };
    
    const request = await createRequest(speakerId, teacherId, requestData);
    res.status(StatusCode.CREATED).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to create request"));
  }
};

/**
 * Update a request's status
 */
const updateRequestStatusHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { requestId } = req.params;
  const { status } = req.body;
  if (!requestId || !status) {
    next(ApiError.missingFields(["requestId", "status"]));
    return;
  }

  try {
    const request = await updateRequestStatus(requestId, status as IRequest["status"]);
    if (!request) {
      next(ApiError.notFound("Request not found"));
      return;
    }
    res.status(StatusCode.OK).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to update request status"));
  }
};

/**
 * Update a request's status (teacher can only update their own requests)
 */
const updateOwnRequestStatusHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const userId = (req.user as any)?._id;
  
  if (!requestId || !status) {
    next(ApiError.missingFields(["requestId", "status"]));
    return;
  }

  if (!userId) {
    next(ApiError.unauthorized("User not authenticated"));
    return;
  }

  try {
    // First check if the request exists and belongs to the current user
    const existingRequest = await Request.findById(requestId).populate('teacherId');
    if (!existingRequest) {
      next(ApiError.notFound("Request not found"));
      return;
    }

    // Check if the request belongs to the current user
    if (existingRequest.teacherId._id.toString() !== userId.toString()) {
      next(ApiError.forbidden("You can only update your own requests"));
      return;
    }

    const request = await updateRequestStatus(requestId, status as IRequest["status"]);
    if (!request) {
      next(ApiError.notFound("Request not found"));
      return;
    }
    res.status(StatusCode.OK).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to update request status"));
  }
};

/**
 * Update admin notes for a request (admin only)
 */
const updateAdminNotesHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { requestId } = req.params;
  const { adminNotes } = req.body;
  
  if (!requestId) {
    next(ApiError.missingFields(["requestId"]));
    return;
  }

  try {
    const request = await updateAdminNotes(requestId, adminNotes || '');
    if (!request) {
      next(ApiError.notFound("Request not found"));
      return;
    }
    res.status(StatusCode.OK).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to update admin notes"));
  }
};

/**
 * Delete a request
 */
const deleteRequestHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { requestId } = req.params;
  if (!requestId) {
    next(ApiError.missingFields(["requestId"]));
    return;
  }

  try {
    const request = await deleteRequest(requestId);
    if (!request) {
      next(ApiError.notFound("Request not found"));
      return;
    }
    res.status(StatusCode.OK).json(request);
  } catch (error) {
    next(ApiError.internal("Unable to delete request"));
  }
};

export {
  getAllRequestsHandler,
  getRequestsByTeacherIdHandler,
  getCurrentUserRequestsHandler,
  getRequestsBySpeakerIdHandler,
  getRequestByIdHandler,
  createRequestHandler,
  updateRequestStatusHandler,
  updateOwnRequestStatusHandler,
  updateAdminNotesHandler,
  deleteRequestHandler,
}; 