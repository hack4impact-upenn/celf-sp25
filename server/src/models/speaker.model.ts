import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
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
    required: true
  }],
  grades: [{
    type: String,
    required: true,
    enum: ['Elementary', 'Middle School', 'High School']
  }],
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
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
  }]
});

interface ISpeaker extends mongoose.Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
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

const Speaker = mongoose.model<ISpeaker>("Speaker", SpeakerSchema);

export { ISpeaker, Speaker };

