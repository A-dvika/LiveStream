import { useState, useEffect, useRef } from 'react';

export interface EyeTrackingResult {
  eyeState: 'Open' | 'Half-Closed' | 'Closed';
  lookingDirection: 'Forward' | 'Away' | 'Down';
}

export const useEyeTracking = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [eyeTracking, setEyeTracking] = useState<EyeTrackingResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  const detectEyeState = async (): Promise<EyeTrackingResult | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => 
      canvas.toBlob(resolve, 'image/jpeg')
    );

    if (!blob) return null;

    // Send to FastAPI backend
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    try {
      const response = await fetch('http://localhost:8000/analyze_eyes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze eye state');

      const result = await response.json();
      return {
        eyeState: result.eye_state,
        lookingDirection: result.looking_direction,
      };
    } catch (error) {
      console.error('Error detecting eye state:', error);
      return null;
    }
  };

  return { eyeTracking, detectEyeState };
}; 