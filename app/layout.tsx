import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { YearProvider } from "@/components/YearProvider";
import { SplashScreen } from "@/components/SplashScreen";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { BackToTop } from "@/components/BackToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { APP_NAME, APP_URL, REPO_URL } from "@/lib/constants";

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

const SITE_DESCRIPTION =
  "Log workouts, track body measurements and see progress analytics. A free, local-first gym tracker with an exercise database, no account and no cloud sync.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Aero Gym - Workout tracker, analytics and progress",
    template: "%s | Aero Gym",
  },
  description: SITE_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: "Khurram", url: REPO_URL }],
  creator: "Khurram",
  keywords: [
    "workout tracker",
    "fitness log",
    "gym app",
    "exercise database",
    "body measurements",
    "BMI",
    "progress charts",
    "local-first",
    "offline fitness app",
  ],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
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
    title: "Aero Gym - Workout tracker",
    description: SITE_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/aero-og.jpg",
        width: 1200,
        height: 630,
        alt: "Aero Gym - log workouts, track measurements and see progress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aero Gym - Workout tracker",
    description: SITE_DESCRIPTION,
    images: ["/aero-og.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const dynamic = "force-dynamic";

/** Structured data: the app itself plus a Google site-search action. */
const SITE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    description: SITE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    screenshot: `${APP_URL}/aero-og.jpg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.google.com/search?q=site:aero-gym.netlify.app+{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable}`}
    >
      <head>
        {/* Apply the saved theme before first paint (no flash, no hydration input). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("workout-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_SCHEMA) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <YearProvider initial={new Date().getFullYear()}>
            {children}
            <SplashScreen />
            <ServiceWorkerRegister />
            <BackToTop />
            <WhatsAppButton />
          </YearProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
