'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-gradient-to-b from-lavender-200 to-white p-6 pt-28 text-gray-800 max-sm:hidden lg:w-[264px]">
    <div className="flex flex-1 flex-col gap-6">
      {sidebarLinks.map((item) => {
        const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
  
        return (
          <Link
            href={item.route}
            key={item.label}
            className={cn(
              'flex gap-4 items-center p-4 rounded-lg justify-start transition-all duration-200',
              {
                'bg-gradient-to-r from-yellow-400 to-white text-white shadow-md': isActive,
                'hover:bg-gradient-to-r from-yellow-300 to-yellow-500 hover:text-white': !isActive,
              }
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={15}
              height={15}
              className="filter brightness-0 invert-0 opacity-90 hover:opacity-100 transition-opacity"
            />
            <p className="text-lg font-semibold max-lg:hidden">{item.label}</p>
          </Link>
        );
      })}
    </div>
  </section>
  );
};  

export default Sidebar;
