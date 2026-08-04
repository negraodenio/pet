import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Compawion — The AI Operating System for Pets",
    template: "%s | Compawion",
  },
  description:
    "The most intelligent AI platform for pet health, behavior, safety, and wellbeing. Compawion detects events, learns your pet's behavior, and acts as their digital guardian.",
  keywords: [
    "pet AI",
    "pet health",
    "pet monitoring",
    "pet behavior",
    "smart pet camera",
    "AI pet assistant",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Compawion",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
