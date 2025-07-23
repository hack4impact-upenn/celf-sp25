import mongoose from "mongoose";

export interface IRequest extends mongoose.Document {
  _id: string;
  speakerId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  status: "Pending Review" | "Pending Speaker Confirmation" | "Approved" | "Archived";
  
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
  budget: string;
  engagementFormat: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new mongoose.Schema(
  {
    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Speaker",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending Review", "Pending Speaker Confirmation", "Approved", "Archived"],
      default: "Pending Review",
    },
    
    // Audience Information
    gradeLevels: [{
      type: String,
      required: true,
      enum: ['Elementary', 'Middle School', 'High School', 'K-5', '6-8', '9-12', 'K-12']
    }],
    subjects: [{
      type: String,
      required: true,
    }],
    estimatedStudents: {
      type: Number,
      required: true,
      min: 1,
    },
    
    // Event Details
    eventName: {
      type: String,
      required: true,
    },
    eventPurpose: {
      type: String,
      required: true,
    },
    dateTime: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    isInPerson: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVirtual: {
      type: Boolean,
      required: true,
      default: false,
    },
    additionalInfo: {
      type: String,
      required: false,
    },
    
    // Speaker Preferences
    expertise: {
      type: String,
      required: true,
    },
    preferredLanguage: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    goals: {
      type: String,
      required: true,
    },
    budget: {
      type: String,
      required: false,
    },
    engagementFormat: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model<IRequest>("Request", RequestSchema);

export default Request; 