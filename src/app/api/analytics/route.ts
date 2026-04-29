import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Student from "@/models/Student";

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Fetch all relevant data for admin analytics. 
    // In a production scenario with thousands of records, we would use $group aggregations and pagination.
    const attendances = await Attendance.find()
      .populate("studentId", "name rollNumber")
      .populate("classId", "name");
      
    const students = await Student.find().select("name rollNumber");
    const classes = await Class.find().select("name");

    return NextResponse.json({ attendances, students, classes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
