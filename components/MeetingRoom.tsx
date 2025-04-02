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
import { useMeetingAdmin } from '../hooks/useMeetingAdmin';
import { useParams } from 'next/navigation';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id: callId } = useParams();
  console.log('🛠️ callId before passing to hook:', callId);

  // Meeting admin hook for logging purposes
  const { adminId } = useMeetingAdmin(callId);
  
  useEffect(() => {
    console.log('🎯 Admin ID:', adminId);
    console.log('📊 Engagement Stats Button Visible to all users');
  }, [adminId]);

  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { mediaStream } = useCameraState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showStats, setShowStats] = useState(false);
  
  // Tracking data for all participants (currently using localUser only)
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

  // Live preview for current FastAPI response
  const [livePreview, setLivePreview] = useState<{
    emotion: string;
    eye_state: string;
    looking_direction: string;
    engagement: string;
  } | null>(null);

  // Attach local media stream to hidden video element
  useEffect(() => {
    if (!videoRef.current || !mediaStream) return;
    const [videoTrack] = mediaStream.getVideoTracks();
    if (videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [mediaStream]);

  // Capture frame and send it to FastAPI endpoint every 15 seconds
  const captureAndSend = async () => {
    if (
      !videoRef.current ||
      !videoRef.current.videoWidth ||
      !videoRef.current.videoHeight
    )
      return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        // Updated endpoint URL to match FastAPI
        const response = await axios.post(
          'http://127.0.0.1:8000/analyze',
          formData
        );
        console.log('📡 FASTAPI RESPONSE:', response.data);
        const { emotion, eye_state, looking_direction, engagement } = response.data;
        
        // Use a fixed participant ID for the local user (adjust if needed)
        const participantId = "localUser";

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

        // Set live preview to show on the UI
        setLivePreview({ emotion, eye_state, looking_direction, engagement });
      } catch (error) {
        console.error('Error detecting emotion/engagement:', error);
      }
    }, 'image/jpeg');
  };

  useEffect(() => {
    const interval = setInterval(captureAndSend, 15000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Hidden video element for capturing frames */}
        <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />

        {/* Live Preview UI to display FastAPI response */}
        {livePreview && (
          <div className="absolute top-4 left-4 bg-white text-black p-3 rounded-xl shadow-lg backdrop-blur-sm">
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
