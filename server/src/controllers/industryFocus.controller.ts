import express from "express";
import StatusCode from "../util/statusCode";
import ApiError from "../util/apiError";
import { IndustryFocus, IIndustryFocus } from "../models/industryFocus.model";
import { Speaker } from "../models/speaker.model";

/**
 * Get all active industry focuses
 */
const getAllIndustryFocuses = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const industryFocuses = await IndustryFocus.find({ isActive: true }).sort({ name: 1 });
    res.status(StatusCode.OK).send(industryFocuses);
  } catch (error) {
    next(ApiError.internal("Failed to fetch industry focuses"));
  }
};

/**
 * Get all industry focuses (including inactive ones) - admin only
 */
const getAllIndustryFocusesAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const industryFocuses = await IndustryFocus.find().sort({ name: 1 });
    res.status(StatusCode.OK).send(industryFocuses);
  } catch (error) {
    next(ApiError.internal("Failed to fetch industry focuses"));
  }
};

/**
 * Create a new industry focus - admin only
 */
const createIndustryFocus = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { name, description } = req.body;

  if (!name) {
    next(ApiError.missingFields(["name"]));
    return;
  }

  try {
    // Check if industry focus with the same name already exists
    const existingIndustryFocus = await IndustryFocus.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingIndustryFocus) {
      next(ApiError.badRequest("An industry focus with this name already exists"));
      return;
    }

    const industryFocus = new IndustryFocus({
      name: name.trim(),
      description: description?.trim() || "",
    });

    await industryFocus.save();
    res.status(StatusCode.CREATED).send(industryFocus);
  } catch (error) {
    next(ApiError.internal("Failed to create industry focus"));
  }
};

/**
 * Update an industry focus - admin only
 */
const updateIndustryFocus = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  if (!name) {
    next(ApiError.missingFields(["name"]));
    return;
  }

  try {
    // Check if industry focus exists
    const existingIndustryFocus = await IndustryFocus.findById(id);
    if (!existingIndustryFocus) {
      next(ApiError.notFound("Industry focus not found"));
      return;
    }

    // Check if another industry focus with the same name exists (excluding current one)
    const duplicateIndustryFocus = await IndustryFocus.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (duplicateIndustryFocus) {
      next(ApiError.badRequest("An industry focus with this name already exists"));
      return;
    }

    // Update the industry focus
    existingIndustryFocus.name = name.trim();
    existingIndustryFocus.description = description?.trim() || "";
    if (typeof isActive === 'boolean') {
      existingIndustryFocus.isActive = isActive;
    }

    await existingIndustryFocus.save();
    res.status(StatusCode.OK).send(existingIndustryFocus);
  } catch (error) {
    next(ApiError.internal("Failed to update industry focus"));
  }
};

/**
 * Delete an industry focus - admin only
 */
const deleteIndustryFocus = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;

  try {
    const industryFocus = await IndustryFocus.findById(id);
    if (!industryFocus) {
      next(ApiError.notFound("Industry focus not found"));
      return;
    }

    // Get the industry focus name before deleting
    const industryFocusName = industryFocus.name;

    // Remove the industry focus from all speakers' industry arrays
    const updateResult = await Speaker.updateMany(
      { industry: industryFocusName },
      { $pull: { industry: industryFocusName } }
    );

    console.log(`Removed "${industryFocusName}" from ${updateResult.modifiedCount} speakers`);

    // Delete the industry focus
    await IndustryFocus.findByIdAndDelete(id);
    
    res.status(StatusCode.OK).send({ 
      message: `Industry focus "${industryFocusName}" deleted successfully. Removed from ${updateResult.modifiedCount} speakers.` 
    });
  } catch (error) {
    next(ApiError.internal("Failed to delete industry focus"));
  }
};

/**
 * Toggle the active status of an industry focus - admin only
 */
const toggleIndustryFocusStatus = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;

  try {
    const industryFocus = await IndustryFocus.findById(id);
    if (!industryFocus) {
      next(ApiError.notFound("Industry focus not found"));
      return;
    }

    industryFocus.isActive = !industryFocus.isActive;
    await industryFocus.save();
    
    res.status(StatusCode.OK).send(industryFocus);
  } catch (error) {
    next(ApiError.internal("Failed to toggle industry focus status"));
  }
};

/**
 * Get count of speakers that would be affected by deleting an industry focus - admin only
 */
const getAffectedSpeakersCount = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;

  try {
    const industryFocus = await IndustryFocus.findById(id);
    if (!industryFocus) {
      next(ApiError.notFound("Industry focus not found"));
      return;
    }

    const count = await Speaker.countDocuments({ industry: industryFocus.name });
    
    res.status(StatusCode.OK).send({ 
      count,
      industryFocusName: industryFocus.name
    });
  } catch (error) {
    next(ApiError.internal("Failed to get affected speakers count"));
  }
};

export {
  getAllIndustryFocuses,
  getAllIndustryFocusesAdmin,
  createIndustryFocus,
  updateIndustryFocus,
  deleteIndustryFocus,
  toggleIndustryFocusStatus,
  getAffectedSpeakersCount,
}; 