import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { classId, studentIds, method = "FACE", status = "PRESENT" } = await req.json();

    if (!classId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const existingAttendances = await Attendance.find({
      classId,
      studentId: { $in: studentIds },
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const existingStudentIds = existingAttendances.map(a => a.studentId.toString());
    const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

    if (newStudentIds.length === 0) {
      return NextResponse.json({ message: "No new attendances to mark" }, { status: 200 });
    }

    const attendanceRecords = newStudentIds.map(id => ({
      studentId: id,
      classId,
      date: new Date(),
      status,
      method,
    }));

    await Attendance.insertMany(attendanceRecords);

    return NextResponse.json({ message: "Attendance marked successfully", count: newStudentIds.length }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
