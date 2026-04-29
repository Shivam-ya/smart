import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  studentId: mongoose.Types.ObjectId;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

export default mongoose.models.Leave || mongoose.model<ILeave>("Leave", LeaveSchema);
