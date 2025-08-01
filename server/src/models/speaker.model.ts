import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: false,
    default: ''
  },
  bio: {
    type: String,
    required: false,
    default: ''
  },
  city: {
    type: String,
    required: false,
    default: ''
  },
  state: {
    type: String,
    required: false,
    default: ''
  },
  country: {
    type: String,
    required: false
  },
  inperson: {
    type: Boolean,
    required: true,
    default: false
  },
  virtual: {
    type: Boolean,
    required: true,
    default: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  industry: [{
    type: String,
    required: false
  }],
  jobTitle: {
    type: String,
    required: false
  },
  grades: [{
    type: String,
    required: false,
    enum: ['Elementary', 'Middle School', 'High School']
  }],
  coordinates: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  languages: [{
    type: String,
    required: false
  }],
  visible: {
    type: Boolean,
    required: true,
    default: false
  }
});

interface ISpeaker extends mongoose.Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  organization: string;
  bio: string;
  city: string;
  state: string;
  country?: string;
  inperson: boolean;
  virtual: boolean;
  imageUrl?: string;
  industry: string[];
  jobTitle?: string;
  grades: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages: string[];
  visible: boolean;
}

const Speaker = mongoose.model<ISpeaker>("Speaker", SpeakerSchema);

export { ISpeaker, Speaker };

