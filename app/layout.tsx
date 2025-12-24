import "./globals.css";
import type { Metadata, Viewport } from "next";

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
  ],
  authors: [{ name: "Quirk AI" }],
  openGraph: {
    title: "DriveDecision — Should You Buy or Lease?",
    description:
      "Get a clear, personalized answer in under 2 minutes. We analyze your financial situation—not just the monthly payment.",
    type: "website",
    locale: "en_US",
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
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
