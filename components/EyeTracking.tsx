// EyeTracking.tsx
import { useEffect, useRef, useState } from "react";
import * as facemesh from "@tensorflow-models/facemesh";
import "@tensorflow/tfjs";

interface EyeTrackingProps {
  participant: string;
  onEngagementChange: (level: string) => void;
}

const EyeTracking = ({ participant, onEngagementChange }: EyeTrackingProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [engagementLevel, setEngagementLevel] = useState("Engaged");

  useEffect(() => {
    const loadModel = async () => {
      const model = await facemesh.load();
      if (videoRef.current) {
        detectFace(model);
      }
    };

    const detectFace = async (model: any) => {
      setInterval(async () => {
        if (videoRef.current) {
          const predictions = await model.estimateFaces({
            input: videoRef.current,
          });

          if (predictions.length > 0) {
            const leftEye = predictions[0].annotations.leftEyeUpper0;
            const rightEye = predictions[0].annotations.rightEyeUpper0;

            if (leftEye && rightEye) {
              // A naive measure of eye openness
              const eyeOpenness = Math.abs(leftEye[3][1] - leftEye[1][1]);
              if (eyeOpenness < 5) {
                setEngagementLevel("Not Engaged");
                onEngagementChange("Not Engaged");
              } else {
                setEngagementLevel("Engaged");
                onEngagementChange("Engaged");
              }
            }
          }
        }
      }, 1000);
    };

    loadModel();
  }, [onEngagementChange]);

  return (
    <div className="p-2 text-blue bg-black/50 rounded-lg">
      <video ref={videoRef} autoPlay muted className="hidden" />
      <p>{participant}: Engagement Level: {engagementLevel}</p>
    </div>
  );
};

export default EyeTracking;
