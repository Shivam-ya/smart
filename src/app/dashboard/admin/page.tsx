"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, UserCheck, BellRing, Loader2, CheckCircle2, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0, presentToday: 0 });
  const [attendanceData, setAttendanceData] = useState([{ name: "Present", value: 0 }, { name: "Absent", value: 0 }]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{success?: boolean, message?: string} | null>(null);

  // Poll for real-time updates every 10 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app we would have dedicated stat endpoints
        // Here we simulate by fetching students, classes
        const [studentRes, classRes, attRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/classes"),
          fetch(`/api/attendance?date=${new Date().toISOString().split("T")[0]}`)
        ]);

        const students = await studentRes.json();
        const classes = await classRes.json();
        const attendance = await attRes.json();

        setStats({
          totalStudents: students.students?.length || 0,
          totalClasses: classes.classes?.length || 0,
          presentToday: attendance.attendance?.length || 0,
        });

        const total = students.students?.length || 1; // avoid / 0
        const present = attendance.attendance?.length || 0;
        const absent = total - present;

        setAttendanceData([
          { name: "Present", value: present },
          { name: "Absent", value: absent < 0 ? 0 : absent },
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#10b981", "#ef4444"]; // Green for Present, Red for Absent

  const handleSendNotifications = async () => {
    if (!confirm("Are you sure you want to send automated warning emails to all students with attendance below 75%?")) return;
    
    setNotifying(true);
    setNotifyResult(null);
    try {
      const res = await fetch("/api/attendance/notifications", { method: "POST" });
      const data = await res.json();
      setNotifyResult({
        success: res.ok,
        message: data.message || data.error || "Failed to send notifications"
      });
      // Clear message after 5 seconds
      setTimeout(() => setNotifyResult(null), 5000);
    } catch (err: any) {
      setNotifyResult({ success: false, message: err.message });
    } finally {
      setNotifying(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to the Admin Dashboard. Here is what's happening today.</p>
        </div>
        <button 
          onClick={handleSendNotifications}
          disabled={notifying}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm font-medium disabled:opacity-70"
        >
          {notifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
          {notifying ? "Sending..." : "Alert Low Attendance"}
        </button>
      </div>

      {notifyResult && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${notifyResult.success ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
          {notifyResult.success ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          <span className="font-medium">{notifyResult.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
            <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
            <h3 className="text-2xl font-bold">{stats.totalClasses}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Present Today (Live)</p>
            <h3 className="text-2xl font-bold">{stats.presentToday}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6">Today's Attendance Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <a href="/dashboard/admin/attendance/camera" className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/80 border border-border flex items-center justify-between transition-colors">
              <div>
                <h4 className="font-semibold text-foreground">Auto Attendance</h4>
                <p className="text-sm text-muted-foreground">Start camera scanner</p>
              </div>
              <div className="text-primary">&rarr;</div>
            </a>
            <a href="/dashboard/admin/students/add" className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/80 border border-border flex items-center justify-between transition-colors">
              <div>
                <h4 className="font-semibold text-foreground">Register Student</h4>
                <p className="text-sm text-muted-foreground">Add details & face capture</p>
              </div>
              <div className="text-primary">&rarr;</div>
            </a>
            <a href="/dashboard/admin/analytics" className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/80 border border-border flex items-center justify-between transition-colors">
              <div>
                <h4 className="font-semibold text-foreground">Analytics Report</h4>
                <p className="text-sm text-muted-foreground">View detailed attendance stats</p>
              </div>
              <div className="text-primary">&rarr;</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
