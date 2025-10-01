import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { QueryProvider } from "@/lib/query-client";
import { Toaster } from "sonner";
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meetify - Cursor for your team's productivity",
  description: "Organize your teams, manage projects, and collaborate seamlessly. Meetify is a platform for orchestrating your meetings, events, and conferences, i.e., Cursor for your team's productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Navigation />
          {children}
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
