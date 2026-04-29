import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const students = await Student.find({ faceDescriptor: { $exists: true, $ne: [] } }).select("name rollNumber faceDescriptor");

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
