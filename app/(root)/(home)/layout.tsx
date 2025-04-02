import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'LiveStream',
  description: 'Learn Live, Anytime, Anywhere – Your Classroom, Reimagined.',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative bg-gradient-to-b from-lavender-200 via-white to-yellow-100 min-h-screen">
      <Navbar />
  
      <div className="flex">
        <Sidebar />
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14 bg-white/60 backdrop-blur-md rounded-tl-[30px] shadow-lg">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
  
};

export default RootLayout;
