import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@/components/query-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "DevStatus - Real-time Developer Tools Monitoring",
  description:
    "Monitor the status of your favorite developer tools and services in real-time. Track outages and performance issues across GitHub, Vercel, AWS, and 100+ developer services.",
  keywords: [
    "status monitor",
    "developer tools",
    "uptime",
    "service status",
    "devops",
    "infrastructure monitoring",
    "github status",
    "vercel status",
    "aws status",
    "cloud services",
    "api status",
    "developer dashboard",
  ],
  authors: [{ name: "DevStatus Team" }],
  creator: "DevStatus Team",
  publisher: "DevStatus",
  robots: "index, follow",
  metadataBase: new URL("https://devstatus.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DevStatus - Developer Tools Monitoring",
    description:
      "Real-time status monitoring for 100+ developer tools and services",
    type: "website",
    url: "https://devstatus.vercel.app",
    siteName: "DevStatus",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevStatus Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStatus - Developer Tools Monitoring",
    description:
      "Real-time status monitoring for 100+ developer tools and services",
    images: ["/og-image.png"],
    creator: "@devstatus",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  generator: "v0.dev",
  category: "Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider defaultTheme="dark" storageKey="devstatus-theme">
              {children}
            </ThemeProvider>
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
