/**
 * Defines the IndustryFocus model for the database and also the interface to
 * access the model in TypeScript.
 */
import mongoose from "mongoose";

const IndustryFocusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
IndustryFocusSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

interface IIndustryFocus extends mongoose.Document {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IndustryFocus = mongoose.model<IIndustryFocus>("IndustryFocus", IndustryFocusSchema);

export { IIndustryFocus, IndustryFocus }; 