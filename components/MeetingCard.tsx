"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();
  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0] px-5 py-8 xl:max-w-[568px] shadow-lg">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#5a189a]">{title}</h1>
            <p className="text-base font-normal text-[#8b5cf6]">{date}</p>
          </div>
        </div>
      </article>
  
      <article className="flex justify-center relative">
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={40}
              height={40}
              className="rounded-full border-2 border-white"
              style={{ position: "absolute", left: `${index * 28}px` }}
            />
          ))}
          <div className="flex-center absolute left-[136px] size-10 rounded-full border-[5px] border-white bg-[#a08bf8] text-white">
            +5
          </div>
        </div>
  
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded-md bg-[#5a189a] px-6 text-white hover:bg-[#6b21a8] shadow-md">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({ title: "Link Copied" });
              }}
              className="rounded-md bg-[#ffdd57] px-6 text-black hover:bg-[#fcca46] shadow-md"
            >
              <Image src="/icons/copy.svg" alt="feature" width={20} height={20} />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};  

export default MeetingCard;
