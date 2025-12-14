import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../../context/AuthContext";
import { Camera, MapPin, RefreshCw, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../config";
import * as faceapi from "face-api.js";

export default function Attendance() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const { user } = useAuth();

    const [location, setLocation] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [distance, setDistance] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [activeClass, setActiveClass] = useState(null);

    // Check for active class
    useEffect(() => {
        const checkClassStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/teacher/dashboard`);
                const data = await res.json();
                setActiveClass(data.active_class);
            } catch (err) {
                console.error("Failed to check class status");
            }
        };

        checkClassStatus();
        const interval = setInterval(checkClassStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load Face API Models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/models"; // Ensure these files are in public/models
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    // faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (e) {
                console.error("Error loading models", e);
            }
        };
        loadModels();
    }, []);

    // GPS
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (err) => setError("Location access denied. Please enable GPS.")
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, []);

    // Face Tracking Loop
    useEffect(() => {
        let isCancelled = false;
        let animationFrameId;

        const detectFaces = async () => {
            if (
                !isCancelled &&
                modelsLoaded &&
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4
            ) {
                const video = webcamRef.current.video;

                // Measure performance - only log if slow
                // const start = performance.now();

                try {
                    // Use TinyFaceDetectorOptions with inputSize for faster inference if valid
                    // default is 416, smaller = faster but less accurate. 320 is a good balance.
                    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });
                    const detections = await faceapi.detectAllFaces(video, options);

                    if (!isCancelled && canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        const displaySize = { width: video.videoWidth, height: video.videoHeight };

                        faceapi.matchDimensions(canvasRef.current, displaySize);
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);

                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                        resizedDetections.forEach(det => {
                            const { x, y, width, height } = det.box;
                            // Smoothing could be added here, but lighter render is priority

                            ctx.strokeStyle = '#6366f1';
                            ctx.lineWidth = 3;
                            ctx.strokeRect(x, y, width, height);
                        });
                    }
                } catch (err) {
                    console.warn("Detection error dropped frame");
                }
            }

            if (!isCancelled) {
                // Schedule next frame only after current one is done
                animationFrameId = requestAnimationFrame(detectFaces);
            }
        };

        if (modelsLoaded && activeClass) {
            detectFaces();
        }

        return () => {
            isCancelled = true;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [modelsLoaded, activeClass]);

    const capture = async () => {
        if (!webcamRef.current) return;
        setLoading(true);
        setResult(null);
        setError("");

        // Compress image
        const imageSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 });

        const url = `${API_BASE_URL}/attendance/mark`;
        console.log("Sending request to:", url);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: user.id,
                    image: imageSrc,
                    latitude: location?.lat,
                    longitude: location?.lon,
                    subject: activeClass
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data.message);
                if (data.distance) setDistance(data.distance);
            } else {
                setError(data.error || "Attendance failed");
            }
        } catch (err) {
            console.error(err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!activeClass) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-slate-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Class Not Started
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Please wait for the teacher to start the class.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Mark Attendance: {activeClass}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Ensure you are on campus and your face is clearly visible.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="relative aspect-video bg-black">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "user" }}
                    />

                    {/* Canvas for Face Tracking */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {!modelsLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                            Loading Face Models...
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {location ? "GPS Active" : "GPS Inactive"}
                                </p>
                                {location && (
                                    <p className="text-xs text-slate-500">
                                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {distance && (
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Distance
                                </p>
                                <p className="text-xs text-slate-500">
                                    {distance.toFixed(2)} km from center
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {result && (
                        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3">
                            <CheckCircle size={20} />
                            <span className="text-sm font-medium">{result}</span>
                        </div>
                    )}

                    <button
                        onClick={capture}
                        disabled={loading || !location}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" />
                        ) : (
                            <>
                                <Camera size={20} />
                                Capture & Mark Attendance
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
