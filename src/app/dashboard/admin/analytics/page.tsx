"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Users } from "lucide-react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<{ attendances: any[], students: any[], classes: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          console.error("Failed to fetch analytics:", json.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Compute Class-wise Attendance
  const classWiseData = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, { name: string, present: number, total: number }> = {};
    
    data.classes.forEach(c => {
      counts[c._id] = { name: c.name, present: 0, total: 0 };
    });

    data.attendances.forEach(att => {
      if (!att.classId) return;
      const cId = typeof att.classId === 'object' ? att.classId._id : att.classId;
      if (counts[cId]) {
        counts[cId].total += 1;
        if (att.status === "PRESENT") {
          counts[cId].present += 1;
        }
      }
    });

    return Object.values(counts).map(c => ({
      name: c.name,
      Present: c.present,
      Absent: c.total - c.present
    }));
  }, [data]);

  // Compute Single Student Data
  const studentData = useMemo(() => {
    if (!data || !selectedStudent) return null;
    
    const studentAtts = data.attendances.filter(a => 
      a.studentId && (a.studentId._id === selectedStudent || a.studentId === selectedStudent)
    );
    
    const total = studentAtts.length;
    const present = studentAtts.filter(a => a.status === "PRESENT").length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    // Group by class for this student
    const classBreakdown: Record<string, { present: number, total: number }> = {};
    studentAtts.forEach(a => {
      if(!a.classId) return;
      const cName = a.classId.name || "Unknown";
      if (!classBreakdown[cName]) classBreakdown[cName] = { present: 0, total: 0 };
      classBreakdown[cName].total += 1;
      if (a.status === "PRESENT") classBreakdown[cName].present += 1;
    });

    return { total, present, percentage, breakdown: classBreakdown, records: studentAtts };
  }, [data, selectedStudent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into attendance metrics and individual student performance.</p>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Class-wise Attendance
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Individual Student Analysis
          </h3>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a student...</option>
            {data?.students.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
            ))}
          </select>
        </div>

        {selectedStudent ? (
          studentData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Classes Held</p>
                  <p className="text-3xl font-bold">{studentData.total}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Classes Attended</p>
                  <p className="text-3xl font-bold text-green-500">{studentData.present}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className={`text-3xl font-bold ${studentData.percentage >= 75 ? 'text-green-500' : studentData.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {studentData.percentage}%
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold mb-4 text-muted-foreground">Subject Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(studentData.breakdown).map(([cName, stats]) => (
                    <div key={cName} className="p-4 bg-background rounded-lg border border-border flex justify-between items-center">
                      <span className="font-medium">{cName}</span>
                      <span className="text-sm px-2 py-1 bg-secondary rounded-md">{Math.round((stats.present / stats.total) * 100)}% ({stats.present}/{stats.total})</span>
                    </div>
                  ))}
                  {Object.keys(studentData.breakdown).length === 0 && (
                    <p className="text-sm text-muted-foreground">No attendance records found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-8 text-muted-foreground">Calculating...</div>
          )
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            Please select a student from the dropdown above to view their detailed attendance report.
          </div>
        )}
      </div>
    </div>
  );
}
