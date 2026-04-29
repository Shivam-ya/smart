import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const params = await context.params;
    const { name, rollNumber, email } = await req.json();
    await connectToDatabase();

    const student = await Student.findByIdAndUpdate(
      params.id,
      { name, rollNumber, email },
      { new: true }
    );

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json({ message: "Student updated", student }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const params = await context.params;
    await connectToDatabase();

    const student = await Student.findByIdAndDelete(params.id);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Also delete associated attendance records
    await Attendance.deleteMany({ studentId: params.id });

    return NextResponse.json({ message: "Student deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
