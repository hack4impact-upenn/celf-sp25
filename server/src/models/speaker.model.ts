import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
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
  organization: {
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
  inperson: {
    type: Boolean,
    required: true,
  },
  languages: {
    type: Array,
    required: true
  },
  avaliability: {
    type: Array,
    required: true
  }
});

interface ISpeaker extends mongoose.Document {
  _id: string;
  userId: string;
  bio: string;
  email: string;
  title: string;
  organisation: string;
  personalSite: string;
  industryFocus: [];
  areaOfExpertise: [];
  ageGroup: string;
  location: string;
  inperson: boolean;
  languages: [];
  available: [];
}

const Speaker = mongoose.model<ISpeaker>("Speaker", SpeakerSchema);

export { ISpeaker, Speaker };

