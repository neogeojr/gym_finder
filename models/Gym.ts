import mongoose from "mongoose";
import type { Address } from "@/types";

export interface IGym {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  address: Address;
  phone?: string;
  daypass: {
    available: boolean;
    price: number;
  };
}

const gymSchema = new mongoose.Schema<IGym>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "A gym name is required."],
      trim: true,
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },
    phone: { type: String, trim: true },
    daypass: {
      available: { type: Boolean, default: false },
      price: { type: Number, min: 0, default: 0 },
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Gym as mongoose.Model<IGym>) ||
  mongoose.model<IGym>("Gym", gymSchema);
