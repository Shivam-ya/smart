"use client";

import { useState, useEffect } from "react";
import { Search, Edit2, Trash2, X, Check } from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", rollNumber: "", email: "" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data.students || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student: any) => {
    setEditingId(student._id);
    setEditData({ name: student.name || "", rollNumber: student.rollNumber, email: student.email || "" });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setStudents(students.map(s => s._id === id ? { ...s, ...editData } : s));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student and their attendance records?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents(students.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(s => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Roster</h1>
          <p className="text-muted-foreground mt-1">Manage enrolled students across your classes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Roll Number</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No students found.</td></tr>
              ) : (
                filtered.map((student: any) => {
                  const isEditing = editingId === student._id;

                  return (
                    <tr key={student._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {isEditing ? (
                          <input 
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Student Name"
                          />
                        ) : (
                          student.name || <span className="text-muted-foreground italic">No Name</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            className="px-2 py-1 bg-background border border-border rounded text-sm font-mono"
                            value={editData.rollNumber}
                            onChange={(e) => setEditData({ ...editData, rollNumber: e.target.value })}
                          />
                        ) : (
                          <span className="bg-secondary px-2 py-1 rounded text-xs font-mono border border-border text-foreground">
                            {student.rollNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="email"
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            placeholder="student@example.com"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {student.email || <span className="italic">No Email</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(student._id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(student)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Student">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(student._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete Student">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
