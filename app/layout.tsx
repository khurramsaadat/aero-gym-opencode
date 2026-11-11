import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { YearProvider } from "@/components/YearProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Aero Gym", template: "%s | Aero Gym" },
  description:
    "Log, track and visualize your fitness routines. Exercise database, body measurements, progress analytics - all in your browser, no account needed.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    other: [
      { rel: "icon", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "icon", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
      { rel: "icon", sizes: "192x192", url: "/android-chrome-192x192.png" },
      { rel: "icon", sizes: "512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  openGraph: {
    title: "Aero Gym - Fitness Tracker",
    description: "Log workouts, track body measurements and visualize progress. Offline-first PWA.",
    url: "https://aero-gym.netlify.app",
    siteName: "Aero Gym",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable}`}>
      <body>
        <ThemeProvider>
          <YearProvider initial={new Date().getFullYear()}>{children}</YearProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
