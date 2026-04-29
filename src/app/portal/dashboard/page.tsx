import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import "@/models/Class";
import { ThemeToggle } from "@/components/theme-provider";
import { UserCircle2, Calendar, BookOpen, LogOut, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function PortalDashboard() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("portal_student_id")?.value;

  if (!studentId) {
    redirect("/portal");
  }

  await connectToDatabase();

  const student = await Student.findById(studentId).populate("enrolledClasses");
  if (!student) {
    // Cookie is invalid
    redirect("/portal");
  }

  // Fetch all attendance for this student
  const attendances = await Attendance.find({ studentId }).populate("classId");

  // Calculate stats
  const totalClasses = attendances.length;
  const presentClasses = attendances.filter(a => a.status === "PRESENT").length;
  const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentClasses / totalClasses) * 100);

  // Group by class
  const classStats: Record<string, { present: number, total: number }> = {};
  attendances.forEach(a => {
    if (!a.classId) return;
    const cName = a.classId.name;
    if (!classStats[cName]) classStats[cName] = { present: 0, total: 0 };
    classStats[cName].total += 1;
    if (a.status === "PRESENT") classStats[cName].present += 1;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <UserCircle2 className="w-6 h-6 text-primary" />
            <span>Student Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <LogOut className="w-4 h-4" />
              Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold uppercase shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold mb-1">{student.name}</h1>
            <div className="text-muted-foreground flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-mono border border-border">
                {student.rollNumber}
              </span>
              {student.email && (
                <span className="bg-secondary px-3 py-1 rounded-full text-sm border border-border">
                  {student.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Total Classes Held</h3>
            </div>
            <p className="text-4xl font-bold">{totalClasses}</p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-medium">Classes Attended</h3>
            </div>
            <p className="text-4xl font-bold">{presentClasses}</p>
          </div>

          <div className={`bg-card border rounded-2xl p-6 shadow-sm ${
            attendancePercentage >= 75 ? 'border-green-500/50 bg-green-500/5' : 
            attendancePercentage >= 50 ? 'border-amber-500/50 bg-amber-500/5' : 
            'border-red-500/50 bg-red-500/5'
          }`}>
            <h3 className="font-medium text-muted-foreground mb-2">Overall Attendance</h3>
            <div className="flex items-end gap-2">
              <p className={`text-5xl font-bold ${
                attendancePercentage >= 75 ? 'text-green-500' : 
                attendancePercentage >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {attendancePercentage}%
              </p>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              {attendancePercentage < 75 ? "Warning: Attendance is below 75%" : "Good standing"}
            </p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <h2 className="text-2xl font-bold tracking-tight pt-4">Subject Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(classStats).map(([name, stats]) => {
            const pct = Math.round((stats.present / stats.total) * 100);
            return (
              <div key={name} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> {name}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    pct >= 75 ? 'bg-green-500/20 text-green-500' : 
                    pct >= 50 ? 'bg-amber-500/20 text-amber-500' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {pct}%
                  </span>
                </div>
                
                <div className="mt-auto">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${
                        pct >= 75 ? 'bg-green-500' : 
                        pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    {stats.present} / {stats.total} Classes
                  </p>
                </div>
              </div>
            );
          })}
          {Object.keys(classStats).length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border">
              No attendance records found yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
