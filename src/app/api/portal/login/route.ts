import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { rollNumber, email } = await req.json();

    if (!rollNumber) {
      return NextResponse.json({ error: "Roll Number is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find student by roll number
    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return NextResponse.json({ error: "No student found with this roll number" }, { status: 404 });
    }

    // If an email exists on the student record, it must match what the student typed
    if (student.email && student.email.toLowerCase() !== email?.toLowerCase()) {
      return NextResponse.json({ error: "Email does not match the registered email for this Roll Number" }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("portal_student_id", student._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
