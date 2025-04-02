'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        "bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0] px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer shadow-lg",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center bg-white bg-opacity-30 size-12 rounded-[10px] shadow-md">
        <Image src={img} alt="meeting" width={27} height={27} />
      </div>
  
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#5a189a]">{title}</h1>
        <p className="text-lg font-normal text-[#6d597a]">{description}</p>
      </div>
    </section>
  );
  
};

export default HomeCard;
