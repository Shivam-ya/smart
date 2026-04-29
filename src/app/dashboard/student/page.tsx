"use client";

import { useState, useEffect } from "react";
import { UserCheck, BookOpen, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function StudentDashboard() {
  const [stats, setStats] = useState({ totalAttended: 0, totalAbsents: 0, overallPercentage: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/attendance`);
      const data = await res.json();
      const records = data.attendance || [];
      
      setAttendanceRecords(records);
      
      const present = records.filter((r: any) => r.status === "PRESENT").length;
      const total = records.length || 1; // avoid / 0 logic natively in real app you track all sessions

      setStats({
        totalAttended: present,
        totalAbsents: records.length - present,
        overallPercentage: Math.round((present / total) * 100)
      });
      
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ["#10b981", "#ef4444"];
  const chartData = [
    { name: "Present", value: stats.totalAttended },
    { name: "Absent", value: stats.totalAbsents > 0 ? stats.totalAbsents : 0 }
  ];

  if (loading) return <div>Loading your dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">View your attendance performance and alerts.</p>
      </div>

      {stats.overallPercentage < 75 && stats.totalAttended > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Warning: Your attendance is below 75%. Please ensure you attend upcoming classes to meet the criteria.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sessions Attended</p>
            <h3 className="text-2xl font-bold">{stats.totalAttended}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Percentage</p>
            <h3 className="text-2xl font-bold">{stats.overallPercentage}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6">Attendance Distribution</h3>
          {stats.totalAttended > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No attendance data recorded yet.
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border overflow-auto max-h-[350px]">
          <h3 className="text-lg font-semibold mb-4">Recent Records</h3>
          <div className="space-y-3">
            {attendanceRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records found.</p>
            ) : (
              attendanceRecords.slice(0, 10).map((record) => (
                <div key={record._id} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{record.classId?.name || "Unknown Class"}</h4>
                    <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                    record.status === "PRESENT" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
