import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "DevStatus - Real-time Developer Tools Monitoring",
  description:
    "Monitor the status of your favorite developer tools and services in real-time. A comprehensive status dashboard for development infrastructure, APIs, and cloud services.",
  keywords: ["status monitor", "developer tools", "uptime", "service status", "devops", "infrastructure monitoring"],
  authors: [{ name: "DevStatus Team" }],
  openGraph: {
    title: "DevStatus - Developer Tools Monitoring",
    description: "Real-time status monitoring for developer tools and services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStatus - Developer Tools Monitoring",
    description: "Real-time status monitoring for developer tools and services",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
