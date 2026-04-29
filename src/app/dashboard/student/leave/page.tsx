"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StudentLeave() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ reason: "", startDate: "", endDate: "" });
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">New Application</h2>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea 
                required 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none" 
                rows={3}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input required type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input required type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Application"}
            </button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Past Applications</h2>
          <div className="space-y-4">
            {leaves.length === 0 ? (
              <p className="text-muted-foreground text-sm">No leave applications found.</p>
            ) : (
              leaves.map(leave => (
                <div key={leave._id} className="p-4 border border-border rounded-xl bg-secondary/20">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{leave.reason}</p>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                      leave.status === "APPROVED" ? "bg-green-500/20 text-green-500" :
                      leave.status === "REJECTED" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
