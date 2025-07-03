/**
 * Defines the Invite model for the database and also the interface to
 * access the model in TypeScript.
 */
import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  email: {
    type: String,
    match:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g,
  },
  verificationToken: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["teacher", "admin", "speaker"],
    required: true,
    default: "speaker",
  },
});

interface IInvite extends mongoose.Document {
  _id: string;
  email: string;
  verificationToken: string;
  role: "teacher" | "admin" | "speaker";
}

const Invite = mongoose.model<IInvite>("Invite", InviteSchema);

export { IInvite, Invite };
