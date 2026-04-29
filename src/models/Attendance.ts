import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  method: "QR" | "GEO" | "FACE" | "MANUAL";
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["PRESENT", "ABSENT", "LEAVE"], default: "PRESENT" },
    method: { type: String, enum: ["QR", "GEO", "FACE", "MANUAL"], default: "QR" },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same student, same class, same day
// We will do this via logic in the API, or a partial index if we strip the time component from date.

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
