import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  rollNumber: string;
  email?: string;
  enrolledClasses: mongoose.Types.ObjectId[];
  faceDescriptor?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    enrolledClasses: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    faceDescriptor: { type: [Number], required: false }
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
