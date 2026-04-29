import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Leave from "@/models/Leave";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const role = req.headers.get("x-user-role");
    const userId = req.headers.get("x-user-id");

    const query = role === "STUDENT" ? { studentId: userId } : {};

    const leaves = await Leave.find(query).populate("studentId", "name email");
    return NextResponse.json({ leaves }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reason, startDate, endDate } = await req.json();
    const studentId = req.headers.get("x-user-id");

    await connectToDatabase();

    const leave = await Leave.create({
      studentId,
      reason,
      startDate,
      endDate,
    });

    return NextResponse.json({ message: "Leave applied", leave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { leaveId, status } = await req.json();
    await connectToDatabase();

    const leave = await Leave.findByIdAndUpdate(leaveId, { status }, { new: true });
    
    // In a real application, here we might trigger the nodemailer notification
    
    return NextResponse.json({ message: `Leave ${status}`, leave }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
