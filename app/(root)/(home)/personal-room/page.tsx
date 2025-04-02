"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

import { useGetCallById } from "@/hooks/useGetCallById";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row">
      <h1 className="text-lg font-semibold text-[#ffd700] lg:text-xl xl:min-w-32">
        {title}:
      </h1>
      <h1 className="truncate text-sm font-bold text-[#f4e1ff] max-sm:max-w-[320px] lg:text-xl">
        {description}
      </h1>
    </div>
  );
};

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const meetingId = user?.id || "unknown_meeting";
  const { call } = useGetCallById(meetingId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const meetingLink = `${baseUrl}/meeting/${meetingId}?personal=true`;

  const startRoom = async () => {
    if (!client) {
      toast({
        title: "Error",
        description: "Stream Video Client is not connected.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCall = client.call("default", meetingId);

      if (!call) {
        await newCall.getOrCreate({
          data: { starts_at: new Date().toISOString() },
        });
      }

      router.push(`/meeting/${meetingId}?personal=true`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to start meeting: ${error?.message ?? "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="flex size-full flex-col gap-10 px-6">
      <h1 className="text-3xl font-extrabold text-[#ffd700]">Personal Meeting Room</h1>

      <div className="flex w-full flex-col gap-8 xl:max-w-[900px] bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0] p-6 rounded-lg shadow-lg">
        <Table title="Topic" description={`${user?.firstName || user?.fullName || "User"}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId} />
        <Table title="Invite Link" description={meetingLink} />
      </div>

      <div className="flex gap-5">
        <Button className="bg-[#a08bf8] hover:bg-[#9076e0]" onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-[#ffd700] hover:bg-[#e6c200] text-black"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied" });
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;
