import "./globals.css";
import type { Metadata, Viewport } from "next";
import { WeatherProvider } from "@/components/WeatherProvider";

export const metadata: Metadata = {
  title: "DriveDecision by Quirk AI — Buy vs Lease Calculator",
  description:
    "Get a personalized buy vs lease decision based on your financial situation. Risk-first analysis, not just monthly payments.",
  keywords: [
    "buy vs lease",
    "car calculator",
    "vehicle financing",
    "lease calculator",
    "auto loan",
    "car payment calculator",
    "quirk auto",
  ],
  authors: [{ name: "Quirk AI" }],
  openGraph: {
    title: "DriveDecision — Should You Buy or Lease?",
    description:
      "Get a clear, personalized answer in under 2 minutes. We analyze your financial situation—not just the monthly payment.",
    type: "website",
    locale: "en_US",
    siteName: "DriveDecision by Quirk AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveDecision — Should You Buy or Lease?",
    description:
      "Get a clear, personalized answer in under 2 minutes. We analyze your financial situation—not just the monthly payment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-300 text-slate-900 antialiased font-sans flex flex-col">
        <WeatherProvider>
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <footer className="bg-slate-600 py-4 relative z-10">
            <p className="text-white text-sm text-center">
              © {new Date().getFullYear()} Quirk Auto Dealers
            </p>
          </footer>
        </WeatherProvider>
      </body>
    </html>
  );
}
