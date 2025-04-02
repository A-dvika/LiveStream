import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useMeetingAdmin = (callId: string | string[]) => {
  const { user } = useUser();
  const client = useStreamVideoClient();

  const [adminId, setAdminId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [engagementStats, setEngagementStats] = useState<Record<string, any>>({});

  useEffect(() => {
    console.log("🚀 useMeetingAdmin - Call ID:", callId);

    if (!callId) {
      console.warn("⚠️ Call ID is missing!");
      setIsLoading(false);
      return;
    }

    if (!client) {
      console.warn("⚠️ Stream Video Client is not initialized!");
      return;
    }

    if (!user?.id) {
      console.warn("⚠️ Clerk User ID is missing! Are you logged in?");
      return;
    }

    const fetchCallDetails = async () => {
      setIsLoading(true);
      try {
        console.log("🔍 Fetching call details for Call ID:", callId);
        
        const { calls } = await client.queryCalls({
          filter_conditions: { id: callId },
        });

        console.log("📞 Stream Video API Response:", calls);

        if (calls.length > 0) {
          const call = calls[0];
          const creatorId = call.state.createdBy?.id;
          
          console.log("👑 Call Creator (Admin ID):", creatorId);

          setAdminId(creatorId || null);
          setIsAdmin(user.id === creatorId);
        } else {
          console.warn("⚠️ No calls found for the given Call ID!");
        }
      } catch (error) {
        console.error("❌ Error fetching call details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallDetails();
  }, [client, callId, user?.id]);

  const updateEngagementStats = (participantId: string, stats: any) => {
    if (participantId === adminId) return;
    setEngagementStats((prev) => ({
      ...prev,
      [participantId]: [...(prev[participantId] || []), stats],
    }));
  };

  return { adminId, isAdmin, isLoading, engagementStats, updateEngagementStats };
};
