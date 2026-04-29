"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leave");
      const data = await res.json();
      setLeaves(data.leaves || []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (leaveId: string, status: string) => {
    try {
      const res = await fetch("/api/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status }),
      });
      if (res.ok) {
        fetchLeaves(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground mt-1">Approve or reject student leave applications.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">Reason</th>
              <th className="px-6 py-4 font-medium">Dates</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No leave requests.</td></tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave._id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{leave.studentId?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{leave.studentId?.email}</p>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                      leave.status === "APPROVED" ? "bg-green-500/20 text-green-500" :
                      leave.status === "REJECTED" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {leave.status === "PENDING" && (
                      <>
                        <button onClick={() => handleStatusUpdate(leave._id, "APPROVED")} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20" title="Approve">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleStatusUpdate(leave._id, "REJECTED")} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
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
