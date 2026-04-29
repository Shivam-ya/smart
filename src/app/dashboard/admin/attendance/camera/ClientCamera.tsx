"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { Loader2, Video, CheckCircle2 } from "lucide-react";

export default function CameraAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedStudents, setRecognizedStudents] = useState<Set<string>>(new Set());
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load classes and models on mount
  useEffect(() => {
    const init = async () => {
      try {
        const classRes = await fetch("/api/classes");
        const classData = await classRes.json();
        setClasses(classData.classes || []);

        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, []);

  // Fetch students with face descriptors when class is selected
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students/faces");
        const data = await res.json();
        const stds = data.students || [];
        setStudents(stds);

        // Build FaceMatcher
        const labeledDescriptors = stds.map((s: any) => {
          const arr = new Float32Array(s.faceDescriptor);
          return new faceapi.LabeledFaceDescriptors(s._id, [arr]); // Label is _id to send to backend
        });

        if (labeledDescriptors.length > 0) {
          setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.45)); // 0.45 threshold
        } else {
          setFaceMatcher(null);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const markBulkAttendance = useCallback(async (studentIds: string[]) => {
    if (studentIds.length === 0 || !selectedClass) return;
    try {
      await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, studentIds, method: "FACE" }),
      });
      // Updating UI is handled by recognizedStudents set
    } catch (err) {
      console.error("Bulk attendance error", err);
    }
  }, [selectedClass]);

  const scanFrames = useCallback(async () => {
    if (!webcamRef.current || !webcamRef.current.video || !isScanning || !faceMatcher || !canvasRef.current) return;

    const video = webcamRef.current.video;
    if (video.readyState === 4) {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, displaySize.width, displaySize.height);

      const newMatches: string[] = [];

      const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const text = result.label === "unknown" ? "Unknown" : students.find(s => s._id === result.label)?.name || "Unknown";
        
        const drawBox = new faceapi.draw.DrawBox(box, { label: text, boxColor: result.label === "unknown" ? "red" : "green" });
        drawBox.draw(canvasRef.current!);

        if (result.label !== "unknown" && !recognizedStudents.has(result.label)) {
          newMatches.push(result.label);
        }
      });

      if (newMatches.length > 0) {
        setRecognizedStudents((prev) => {
          const next = new Set(prev);
          newMatches.forEach(id => next.add(id));
          return next;
        });
        markBulkAttendance(newMatches);
      }
    }

    if (isScanning) {
      requestAnimationFrame(scanFrames);
    }
  }, [isScanning, faceMatcher, recognizedStudents, students, markBulkAttendance]);

  useEffect(() => {
    if (isScanning) {
      scanFrames();
    }
  }, [isScanning, scanFrames]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auto Attendance</h1>
          <p className="text-muted-foreground mt-1">Select a class and start scanning to mark attendance automatically.</p>
        </div>
        <div className="w-64">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={isScanning}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Class...</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> Live Scanner</h3>
            <button
              onClick={() => setIsScanning(!isScanning)}
              disabled={!modelsLoaded || !selectedClass || !faceMatcher}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isScanning ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isScanning ? "Stop Scanning" : "Start Scanning"}
            </button>
          </div>
          
          <div className="relative bg-black min-h-[400px] flex items-center justify-center">
            {!modelsLoaded ? (
              <div className="text-white flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading AI Models...</p>
              </div>
            ) : !selectedClass ? (
              <div className="text-white/50">Please select a class to begin</div>
            ) : !faceMatcher ? (
              <div className="text-white/50">No students found with face data</div>
            ) : (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  className="w-full h-auto"
                  videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold mb-4 border-b border-border pb-4">Marked Present Today</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {students.filter(s => recognizedStudents.has(s._id)).map((student) => (
              <div key={student._id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                </div>
              </div>
            ))}
            {recognizedStudents.size === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-10">
                No students detected yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
