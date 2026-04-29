"use client";

import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, MapPin, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";

export default function MarkAttendance() {
  const [classId, setClassId] = useState("");
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const webcamRef = useRef<Webcam>(null);

  // Simulating QR scan by manually inputting the class ID that would be parsed from QR
  const handleQRSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;
    setStep(2);
    getLocation();
  };

  const getLocation = () => {
    setLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("Unable to retrieve your location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  const handleCaptureAndMark = async () => {
    if (!location) {
      setStatus("error");
      setMessage("Location is required for attendance.");
      return;
    }

    setCapturing(true);

    // Simulate clicking photo
    const imageSrc = webcamRef.current?.getScreenshot();
    
    // Simulate face matching delay
    await new Promise(r => setTimeout(r, 1500)); 

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          method: "GEO",
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Attendance marked successfully! Face matched and Location verified.");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to mark attendance.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred.");
    } finally {
      setCapturing(false);
      setStep(3);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-card border border-border shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ScanLine className="text-primary" /> Smart Attendance
        </h2>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <p className="text-muted-foreground">Scan the QR code displayed by your teacher (simulated below by entering Class ID).</p>
            <form onSubmit={handleQRSimulate}>
              <input
                type="text"
                placeholder="Enter Class ID from QR"
                required
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
              >
                Simulate QR Scan
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 bg-secondary/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-blue-500 w-5 h-5" />
                <h3 className="font-semibold">Geo-Location Check</h3>
              </div>
              {locating ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> Acquiring coordinates...
                </p>
              ) : locationError ? (
                <p className="text-sm text-destructive">{locationError}</p>
              ) : location ? (
                <p className="text-sm text-green-500 font-medium">Located: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
              ) : null}
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-border aspect-video bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              {capturing && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-medium flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing Face...
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleCaptureAndMark}
              disabled={capturing || locating || !!locationError}
              className="w-full mt-4 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              Capture Face & Mark Attendance
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95">
            {status === "success" ? (
              <>
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-500 mb-2">Success!</h3>
                <p className="text-center text-muted-foreground">{message}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-20 h-20 text-destructive mb-4" />
                <h3 className="text-2xl font-bold text-destructive mb-2">Failed</h3>
                <p className="text-center text-muted-foreground">{message}</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-6 py-2 px-6 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 outline-none"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
