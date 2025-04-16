import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  organisation: {
    type: String,
    required: true,
  },
  personalSite: {
    type: String,
    required: true
  },
  industryFocus: {
    type: Array,
    required: true
  },
  areaOfExpertise: {
    type: Array,
    required: true
  },
  ageGroup: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
  },
  speakingFormat: {
    type: String,
    required: true,
  },
  languages: {
    type: Array,
    required: false
  },
  avaliability: {
    type: Array,
    required: false
  }
});

interface ISpeaker extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  title: string;
  organization: string;
  personalSite: string;
  industryFocus: [];
  areaOfExpertise: [];
  ageGroup: string;
  location: string;
  speakingFormat: string;
  languages: [];
  available: [];
}

const Speaker = mongoose.model<ISpeaker>("Speaker", SpeakerSchema);

export { ISpeaker, Speaker };

