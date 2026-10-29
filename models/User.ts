import mongoose from "mongoose";
import type { Role } from "@/types";

export interface IUser {
  email: string;
  password: string;
  role: Role;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "An email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
    },
    role: {
      type: String,
      enum: ["regular", "owner"],
      default: "regular",
    },
  },
  { timestamps: true },
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
