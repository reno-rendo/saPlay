"use client";

import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

interface FooterProps {
  siteName?: string | null;
  description?: string | null;
  footerText?: string | null;
  copyrightText?: string | null;
}

export function Footer({ siteName, description, footerText, copyrightText }: FooterProps) {
  const pathname = usePathname();

  // Hide footer on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="border-t border-white/5 bg-background/80 backdrop-blur-xl relative overflow-hidden pb-28">
      {/* Glow effect at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Site Name and Description removed as requested */}

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

          {/* Copyright */}
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            {copyrightText || `© 2026 MADE WITH ❤️ BY BAHLIL`}
          </p>
        </div>
      </div>
    </footer>
  );
}
