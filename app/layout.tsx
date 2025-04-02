import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LiveStream",
  description: "Learn & Teach Live, Anytime, Anywhere – Your Classroom, Reimagined.",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            logoImageUrl: "/icons/yoom-logo.svg",
          },
          variables: {
            colorText: "#fff",
            colorPrimary: "#7B2CBF", // Deep Lavender
            colorBackground: "#F8F4FF", // Soft Lavender-White
            colorInputBackground: "#EDE7F6", // Light Lavender Tint
            colorInputText: "#4A148C", // Darker Text for Contrast
          },
        }}
      >
        <body className={`${inter.className} bg-gradient-to-b from-lavender-300 via-white to-yellow-200 text-[#4A148C]`}>
          <Toaster />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}  