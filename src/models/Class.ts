import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  schedule?: {
    day: string; // e.g., "Monday"
    startTime: string; // "10:00"
    endTime: string;   // "11:30"
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      radius: { type: Number, default: 100 },
    },
    schedule: [
      {
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);
