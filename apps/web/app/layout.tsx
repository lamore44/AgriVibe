import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/navbar";
import PwaRegister from "@/components/pwa-register";

import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AgriVibe | Asisten Pertanian Cerdas Sembalun",
  description:
    "Platform AI untuk membantu petani Sembalun menentukan tanaman terbaik dan cara perawatan yang tepat berdasarkan kondisi lahan dan cuaca.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriVibe",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-ink-900 text-slate-100 antialiased">
        <PwaRegister />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
