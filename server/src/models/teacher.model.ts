import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: false,
  },
  gradeLevel: {
    type: String,
    required: true,
  }, 
  subjects: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
});

interface ITeacher extends mongoose.Document {
  _id: string;
  userId: string;
  school: string;
  city: string;
  state: string;
  country: string;
  gradeLevel: string;
  subjects: string[];
  bio: string;
}

const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);

export { ITeacher, Teacher };
