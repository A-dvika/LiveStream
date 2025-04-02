'use client';
import { useState, useRef, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, BarChart3 } from 'lucide-react';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import LiveStats from './LiveStats';
import { useParams } from 'next/navigation';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id: callId } = useParams();
  console.log('🛠️ callId before passing to hook:', callId);

  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { mediaStream } = useCameraState();

  // Local video ref for capturing local frame
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [showStats, setShowStats] = useState(false);

  // Tracking data stored by participant id.
  // Each key holds an array of engagement entries (with timestamp, emotion, eye_state, etc.)
  const [trackingData, setTrackingData] = useState<
    Record<
      string,
      {
        timestamp: string;
        emotion: string;
        eye_state: string;
        looking_direction: string;
        engagement: string;
      }[]
    >
  >({});

  // Live preview for the latest local FastAPI response
  const [livePreview, setLivePreview] = useState<{
    emotion: string;
    eye_state: string;
    looking_direction: string;
    engagement: string;
  } | null>(null);

  // Attach local media stream to off-screen local video element
  useEffect(() => {
    if (!localVideoRef.current || !mediaStream) return;
    const [videoTrack] = mediaStream.getVideoTracks();
    if (videoTrack) {
      localVideoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [mediaStream]);

  // Capture frame from a given video element and send to FastAPI
  const captureFrameAndSend = async (
    videoElement: HTMLVideoElement,
    participantId: string
  ) => {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
      console.log(`Video dimensions not ready for participant: ${participantId}`);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      try {
        const response = await axios.post('https://livestream-backend-2.onrender.com/analyze', formData);
        console.log(`📡 FASTAPI RESPONSE for ${participantId}:`, response.data);
        const { emotion, eye_state, looking_direction, engagement } = response.data;
        // Update tracking data for this participant
        setTrackingData((prev) => ({
          ...prev,
          [participantId]: [
            ...(prev[participantId] || []),
            {
              timestamp: new Date().toISOString(),
              emotion,
              eye_state,
              looking_direction,
              engagement,
            },
          ],
        }));

        // For local participant, update live preview
        if (participantId === 'localUser') {
          setLivePreview({ emotion, eye_state, looking_direction, engagement });
        }
      } catch (error) {
        console.error(`Error detecting engagement for ${participantId}:`, error);
      }
    }, 'image/jpeg');
  };

  // Capture local frame from localVideoRef
  const captureLocalFrame = async () => {
    if (localVideoRef.current) {
      await captureFrameAndSend(localVideoRef.current, 'localUser');
    }
  };

  // Capture frames for remote participants by querying video elements in the DOM
  const captureRemoteFrames = async () => {
    // Get all video elements on the page
    const allVideos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
    // Filter out the off-screen local video element using our ref
    const remoteVideos = allVideos.filter((video) => video !== localVideoRef.current);
    // Optionally, further filter by visibility or specific class names if available.
    remoteVideos.forEach((video, index) => {
      // Try to read a data attribute for participant ID; if not available, assign one using index.
      const participantId =
        video.getAttribute('data-participant-id') || `remote-${index + 1}`;
      captureFrameAndSend(video, participantId);
    });
  };

  // Combined function to capture both local and remote frames
  const captureAllFrames = async () => {
    await captureLocalFrame();
    await captureRemoteFrames();
  };

  // Set up an interval to capture frames every 15 seconds
  useEffect(() => {
    const interval = setInterval(captureAllFrames, 15000);
    return () => clearInterval(interval);
  }, []);

  // If call hasn't joined yet, show loader.
  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0]">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          {layout === 'grid' ? (
            <PaginatedGridLayout />
          ) : (
            <SpeakerLayout
              participantsBarPosition={layout === 'speaker-left' ? 'right' : 'left'}
            />
          )}
        </div>

        {/* Engagement Stats Button visible to all users */}
        <button
          onClick={() => setShowStats(true)}
          className="absolute top-4 right-20 flex items-center rounded-md bg-[#a08bf8] px-4 py-2 text-white shadow-md hover:bg-[#9076e0]"
        >
          <BarChart3 size={16} className="mr-2" /> Show Engagement Stats
        </button>

        {/* Off-screen local video element for capturing local frame */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}
        />

        {/* Live Preview UI to display local FastAPI analysis results */}
        {livePreview && (
          <div className="absolute top-4 left-4 p-3 rounded-xl shadow-lg backdrop-blur-sm">
            <p>
              <strong>Emotion:</strong> {livePreview.emotion}
            </p>
            <p>
              <strong>Eye State:</strong> {livePreview.eye_state}
            </p>
            <p>
              <strong>Direction:</strong> {livePreview.looking_direction}
            </p>
            <p>
              <strong>Engagement:</strong> {livePreview.engagement}
            </p>
          </div>
        )}
      </div>

      {/* Show LiveStats overlay if enabled */}
      {showStats && (
        <LiveStats
          emotionData={Object.entries(trackingData).flatMap(([participant, data]) =>
            data.map(({ timestamp, emotion, eye_state, looking_direction, engagement }) => ({
              timestamp,
              emotion,
              eye_state,
              looking_direction,
              engagement,
              participant,
            }))
          )}
          onClose={() => setShowStats(false)}
        />
      )}

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 pb-4">
        <CallControls onLeave={() => router.push('/')} />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#ffd700] px-4 py-2 text-black hover:bg-[#e6c200]">
            <LayoutList size={20} className="text-black" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-yellow-500 bg-white text-black shadow-md">
            {[
              { label: 'Grid', value: 'grid' },
              { label: 'Speaker-Left', value: 'speaker-left' },
              { label: 'Speaker-Right', value: 'speaker-right' },
            ].map(({ label, value }) => (
              <div key={value}>
                <DropdownMenuItem
                  onClick={() => setLayout(value as CallLayoutType)}
                  className="hover:bg-[#fff6b0]"
                >
                  {label}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-yellow-500" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#a08bf8] px-4 py-2 text-white shadow-md hover:bg-[#9076e0]">
            <Users size={20} />
          </div>
        </button>
        {showParticipants && (
          <>
            {console.log('Rendering ParticipantDetails')}
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </>
        )}

        {!searchParams.get('personal') && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;