import type { Metadata } from "next";
import "@/styles/globals.css";
import { db } from "@/lib/db";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformSelector } from "@/components/PlatformSelector";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense } from "react";
import GlobalPopup from "@/components/GlobalPopup";

import AdScriptRenderer from "@/components/ads/AdScriptRenderer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.query.generalSettings.findFirst();
  return {
    title: settings?.siteName || "SaPlay - Streaming Drama Pendek",
    description: settings?.description || "Nonton drama pendek gratis dan tanpa iklan di SaPlay.",
    icons: settings?.faviconUrl ? [{ rel: "icon", url: settings.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await db.query.generalSettings.findFirst();
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <AdScriptRenderer position="head" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Header
              siteName={settings?.siteName}
              logoUrl={settings?.logoUrl}
            />
            <AdScriptRenderer position="below_header" className="container py-4" />
          </Suspense>
          {children}
          <AdScriptRenderer position="footer" />
          <PlatformSelector />
          <Footer />
          <GlobalPopup />
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
