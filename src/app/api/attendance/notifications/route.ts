import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Find all students that have an email
    const students = await Student.find({ email: { $exists: true, $ne: "" } });
    
    let sentCount = 0;
    const notifiedStudents = [];

    for (const student of students) {
      // Get all attendance records for this student
      const records = await Attendance.find({ studentId: student._id });
      
      if (records.length === 0) continue; // Skip if no classes held

      const total = records.length;
      const present = records.filter(r => r.status === "PRESENT").length;
      const percentage = Math.round((present / total) * 100);

      // If attendance is below 75%, send an email
      if (percentage < 75) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #ef4444;">Attendance Warning</h2>
            <p>Dear ${student.name},</p>
            <p>This is an automated notification regarding your attendance in your enrolled classes.</p>
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Current Attendance: <span style="color: #ef4444; font-size: 1.2em;">${percentage}%</span></strong>
            </div>
            <p>Your attendance has fallen below the required threshold of 75%. Please ensure you attend upcoming classes to maintain good standing.</p>
            <br/>
            <p>Regards,<br/>Admin Team</p>
          </div>
        `;

        await sendEmail(
          student.email,
          `Action Required: Low Attendance Warning (${percentage}%)`,
          emailHtml
        );

        sentCount++;
        notifiedStudents.push(student.name);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent ${sentCount} warning emails.`,
      notified: notifiedStudents
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Notification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
