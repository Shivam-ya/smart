import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Class from "@/models/Class";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const teacherId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    let classes;
    if (role === "ADMIN") {
      classes = await Class.find({ teacherId }).populate("teacherId", "name email");
    } else {
      classes = await Class.find().populate("teacherId", "name email");
    }

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create classes" }, { status: 403 });
    }

    const { name, subject, _location, schedule } = await req.json();
    const teacherId = req.headers.get("x-user-id");

    await connectToDatabase();
    
    // In our simplified demo, location can be an object { latitude, longitude, radius }
    const newClass = await Class.create({
      name,
      subject,
      teacherId,
      location: _location,
      schedule,
    });

    return NextResponse.json({ message: "Class created", class: newClass }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
