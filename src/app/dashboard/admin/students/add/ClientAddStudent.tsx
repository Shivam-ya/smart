"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { Loader2, Camera, Upload, UserPlus } from "lucide-react";

export default function AddStudent() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", rollNumber: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [error, setError] = useState("");
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
        setError("Failed to load face recognition models. Please run the download script.");
      }
    };
    loadModels();
  }, []);

  const captureFace = async () => {
    if (!webcamRef.current || !webcamRef.current.video || !modelsLoaded) return;
    
    setLoading(true);
    setError("");
    
    try {
      const video = webcamRef.current.video;
      if (video.readyState === 4) {
        const detection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })).withFaceLandmarks().withFaceDescriptor();
        
        if (!detection) {
          setError("No face detected in the frame. Please try again.");
        } else {
          setFaceDescriptor(Array.from(detection.descriptor));
        }
      } else {
        setError("Camera not ready yet.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process face");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceDescriptor) {
      setError("Please capture the student's face first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          faceDescriptor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/dashboard/admin/students");
    } catch (err: any) {
      setError(err.message || "Failed to add student");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Student</h1>
        <p className="text-muted-foreground mt-1">Add a new student and capture their biometric data.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Roll Number</label>
              <input
                required
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                placeholder="e.g. CS-2026-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                placeholder="student@example.com"
              />
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Status: {faceDescriptor ? <span className="text-green-500 font-semibold">Face Captured ✓</span> : <span className="text-amber-500">Pending Capture</span>}
              </p>
              
              <button
                type="submit"
                disabled={loading || !faceDescriptor}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <UserPlus className="w-4 h-4" />
                Register Student
              </button>
            </div>
          </form>
        </div>

        {/* Camera Section */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="font-semibold mb-4">Biometric Capture</h3>
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex items-center justify-center min-h-[300px]">
            {!modelsLoaded ? (
              <div className="text-white flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading AI Models...</p>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
              />
            )}
            
            {/* Overlay frame */}
            <div className="absolute inset-0 border-4 border-primary/30 rounded-xl pointer-events-none"></div>
          </div>
          
          <button
            type="button"
            onClick={captureFace}
            disabled={!modelsLoaded || loading}
            className="mt-4 w-full py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Capture Face
          </button>
        </div>
      </div>
    </div>
  );
}
