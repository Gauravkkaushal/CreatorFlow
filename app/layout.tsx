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
      <body className="min-h-screen bg-slate-50 antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
