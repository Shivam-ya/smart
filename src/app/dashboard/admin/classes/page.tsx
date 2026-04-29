"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Plus, QrCode } from "lucide-react";

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeQRClass, setActiveQRClass] = useState<string | null>(null);
  const [qrKey, setQrKey] = useState(Date.now());
  const [formData, setFormData] = useState({ name: "", lat: "", lng: "", radius: 100 });

  useEffect(() => {
    fetchClasses();
  }, []);

  // QR auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeQRClass) {
      interval = setInterval(() => {
        setQrKey(Date.now()); // forces re-render of QR with new timestamp logic behind it
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [activeQRClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        _location: {
          latitude: parseFloat(formData.lat) || 0,
          longitude: parseFloat(formData.lng) || 0,
          radius: formData.radius,
        }
      };

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", lat: "", lng: "", radius: 100 });
        fetchClasses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground mt-1">Create classes and generate session QR codes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="text-xl font-bold">{cls.name}</h3>
            <div className="text-xs text-muted-foreground mb-4 mt-2 space-y-1">
              <p>Geo: {cls.location?.latitude}, {cls.location?.longitude}</p>
              <p>Radius: {cls.location?.radius}m</p>
            </div>
            <button
              onClick={() => setActiveQRClass(cls._id)}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
            >
              <QrCode className="w-4 h-4" /> Show QR
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4">Create New Class</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQRClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setActiveQRClass(null)}>
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-black">Scan to Mark Attendance</h2>
            {/* The QR Code value includes a timestamp so it changes and is only valid briefly */}
            <QRCodeSVG value={JSON.stringify({ classId: activeQRClass, t: qrKey })} size={300} />
            <p className="mt-6 text-sm font-medium text-gray-500">Auto-refreshes every 30 seconds</p>
            <button onClick={() => setActiveQRClass(null)} className="mt-8 px-6 py-2 bg-black text-white rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
