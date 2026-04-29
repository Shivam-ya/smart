import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const students = await Student.find();

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
