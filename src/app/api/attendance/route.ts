import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const classId = req.nextUrl.searchParams.get("classId");
    const dateStr = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
    const studentId = req.nextUrl.searchParams.get("studentId");
    const role = req.headers.get("x-user-role");
    const userId = req.headers.get("x-user-id");

    let query: any = {};
    if (classId) query.classId = classId;
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (role === "STUDENT") {
      // Only get own attendance
      query.studentId = userId;
    } else if (studentId) {
      query.studentId = studentId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("studentId", "name email")
      .populate("classId", "name subject location"); // include location for UI to show

    return NextResponse.json({ attendance: attendanceRecords }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { classId, method, status = "PRESENT", latitude, longitude } = await req.json();
    const studentId = req.headers.get("x-user-id"); // In this context, studentId corresponds to the userId for simplicity of auth

    if (!classId) {
      return NextResponse.json({ error: "Missing classId" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Time-based / Deduplication validation check
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const existing = await Attendance.findOne({
      studentId,
      classId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return NextResponse.json({ error: "Attendance already marked for today" }, { status: 400 });
    }

    // 2. Geolocation logic
    const cls = await Class.findById(classId);
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    if (method === "GEO" || method === "QR") {
      if (cls.location && cls.location.latitude && cls.location.longitude) {
        if (!latitude || !longitude) {
           return NextResponse.json({ error: "Location required for this class attendance" }, { status: 400 });
        }
        
        const distance = calculateDistanceInMeters(
          cls.location.latitude,
          cls.location.longitude,
          latitude,
          longitude
        );

        if (distance > (cls.location.radius || 100)) {
           return NextResponse.json({ error: `Not in range. You are ${Math.round(distance)}m away.` }, { status: 400 });
        }
      }
    }

    const newAttendance = await Attendance.create({
      studentId,
      classId,
      date: new Date(),
      status,
      method,
    });

    return NextResponse.json({ message: "Attendance marked successfully", attendance: newAttendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
}
