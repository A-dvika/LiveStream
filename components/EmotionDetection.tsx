import React, { useRef, useEffect, useState } from "react";
import { useCallStateHooks, CallingState } from "@stream-io/video-react-sdk";
import axios from "axios";

type DetectionResult = {
  emotion: string;
  emotion_confidence: number;
  eye_state: string;
  looking_direction: string;
  engagement: string;
};

const EmotionDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult>({
    emotion: "Detecting...",
    emotion_confidence: 0,
    eye_state: "",
    looking_direction: "",
    engagement: "",
  });

  const { useCameraState, useCallCallingState } = useCallStateHooks();
  const { mediaStream } = useCameraState();
  const callingState = useCallCallingState();

  // Attach video stream to hidden video element
  useEffect(() => {
    if (!videoRef.current || !mediaStream) return;
    const [videoTrack] = mediaStream.getVideoTracks();
    if (videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [mediaStream]);

  // Capture and send frame every 15 seconds
  const captureAndSend = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        // Updated endpoint URL to match FastAPI
        const response = await axios.post("http://127.0.0.1:8000/analyze", formData);
        console.log("API Response:", response.data);
        setDetectionResult(response.data);
      } catch (error) {
        console.error("Error detecting emotion:", error);
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    const interval = setInterval(captureAndSend, 15000); // Capture every 15 sec
    return () => clearInterval(interval);
  }, []);

  // Stop camera when call state is not joined
  useEffect(() => {
    if (callingState !== CallingState.JOINED && mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }, [callingState, mediaStream]);

  // Manual camera stop button
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setDetectionResult({
      emotion: "Camera Off",
      emotion_confidence: 0,
      eye_state: "",
      looking_direction: "",
      engagement: "",
    });
  };

  return (
    <div>
      <h3>Emotion: {detectionResult.emotion}</h3>
      <h4>Engagement: {detectionResult.engagement}</h4>
      <p>Eye State: {detectionResult.eye_state}</p>
      <p>Looking Direction: {detectionResult.looking_direction}</p>
      <p>Confidence: {detectionResult.emotion_confidence}</p>
      <video ref={videoRef} autoPlay muted style={{ display: "none" }} />
      <button onClick={stopCamera} className="bg-red-600 px-4 py-2 text-white rounded">
        Close Camera
      </button>
    </div>
  );
};

export default EmotionDetection;
