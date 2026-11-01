import mongoose from "mongoose";
import type { PassStatus } from "@/types";

export interface IPass {
  userId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  code: string;
  validFrom: Date;
  validTo: Date;
  status: PassStatus;
}

const passSchema = new mongoose.Schema<IPass>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    code: { type: String, required: true, unique: true },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "redeemed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Pass as mongoose.Model<IPass>) ||
  mongoose.model<IPass>("Pass", passSchema);
