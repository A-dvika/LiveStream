"use client";
import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import Alert from "./Alert";
import { Button } from "./ui/button";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-extrabold text-[#ffd700]">
        Meeting Setup
      </h1>

      <div className="w-full max-w-lg rounded-lg bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0] p-6 shadow-lg flex flex-col items-center">
  <div className="w-full flex justify-center">
    <VideoPreview className="w-full aspect-video rounded-lg object-cover" />
  </div>

  <div className="mt-4 flex flex-col items-center gap-4 w-full">
    <label className="flex items-center gap-2 text-lg font-medium text-[#6b3fa0]">
      <input
        type="checkbox"
        checked={isMicCamToggled}
        onChange={(e) => setIsMicCamToggled(e.target.checked)}
        className="h-5 w-5 accent-[#a08bf8]"
      />
      Join with mic and camera off
    </label>

    <DeviceSettings />
  </div>
</div>


      <Button
        className="rounded-md bg-[#a08bf8] hover:bg-[#9076e0] px-6 py-3 text-lg font-semibold text-white shadow-md"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
