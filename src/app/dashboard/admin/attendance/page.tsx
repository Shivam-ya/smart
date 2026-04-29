"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Papa from "papaparse";

export default function AdminAttendanceLogs() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchRecords(filterDate);
  }, [filterDate]);

  const fetchRecords = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      setRecords(data.attendance || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csvData = records.map(r => ({
      "Student Name": r.studentId?.name || "Unknown",
      "Email": r.studentId?.email || "Unknown",
      "Class": r.classId?.name || "Unknown",
      "Subject": r.classId?.subject || "Unknown",
      "Date": new Date(r.date).toLocaleDateString(),
      "Time": new Date(r.date).toLocaleTimeString(),
      "Status": r.status,
      "Method": r.method
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
          <p className="text-muted-foreground mt-1">View and export class attendance records.</p>
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Filter by Date</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-sm"
            />
          </div>
          <button 
            onClick={downloadCSV}
            disabled={records.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Student Info</th>
              <th className="px-6 py-4 font-medium">Class / Subject</th>
              <th className="px-6 py-4 font-medium">Time Marked</th>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No records found for this date.</td></tr>
            ) : (
              records.map(record => (
                <tr key={record._id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{record.studentId?.name}</p>
                    <p className="text-xs text-muted-foreground">{record.studentId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{record.classId?.name}</p>
                    <p className="text-xs text-muted-foreground">{record.classId?.subject}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(record.date).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded border border-border">{record.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                      record.status === "PRESENT" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
