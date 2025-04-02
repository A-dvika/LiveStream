import { useState, useEffect, useRef } from 'react';

// Emotion labels matching your Python model
export const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];

export interface EmotionDetectionResult {
  emotion: string;
  confidence: number;
}

export const useEmotionDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [emotion, setEmotion] = useState<EmotionDetectionResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  const detectEmotion = async (): Promise<EmotionDetectionResult | null> => {
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
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze emotion');

      const result = await response.json();
      return {
        emotion: result.emotion,
        confidence: result.confidence || 0,
      };
    } catch (error) {
      console.error('Error detecting emotion:', error);
      return null;
    }
  };

  return { emotion, detectEmotion };
}; 