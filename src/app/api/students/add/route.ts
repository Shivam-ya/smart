import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, rollNumber, email, faceDescriptor } = await req.json();

    if (!name || !rollNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return NextResponse.json({ error: "Roll number already exists" }, { status: 400 });
    }

    const newStudent = await Student.create({
      name,
      rollNumber,
      email,
      faceDescriptor: faceDescriptor || [],
    });

    return NextResponse.json({ message: "Student added successfully", student: newStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
