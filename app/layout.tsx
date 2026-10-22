import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "CreatorFlow AI — YouTube Creator Command Center",
    template: "%s | CreatorFlow AI",
  },
  description:
    "AI-powered YouTube creator command center. Analyze audience comments, discover content opportunities, plan your calendar, and manage livestreams — all in one workspace.",
  keywords: [
    "YouTube creator tools",
    "AI content planning",
    "audience intelligence",
    "YouTube analytics",
    "content calendar",
    "livestream management",
  ],
  authors: [{ name: "CreatorFlow AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "CreatorFlow AI",
    title: "CreatorFlow AI — YouTube Creator Command Center",
    description: "From audience insights to action. AI-powered creator intelligence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#0f0f0f] antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#212121',
                border: '1px solid #3e3e3e',
                color: '#f1f1f1',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
