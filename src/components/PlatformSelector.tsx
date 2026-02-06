"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { usePlatform } from "@/hooks/usePlatform";
import { cn } from "@/lib/utils";

export function PlatformSelector() {
  const pathname = usePathname();
  const { currentPlatform, setPlatform, platforms } = usePlatform();

  // Hide on watch pages and admin pages
  if (pathname?.startsWith("/watch") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 md:bottom-10 left-0 right-0 z-[100] flex justify-center px-2 sm:px-4 animate-fade-in-up">
      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-2.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-x-auto max-w-[95vw] sm:max-w-[90vw] no-scrollbar">
        {platforms.map((platform) => {
          const isActive = currentPlatform === platform.id;

          return (
            <button
              key={platform.id}
              onClick={() => setPlatform(platform.id)}
              className={cn(
                "relative group flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0",
                // Thumb-friendly padding: minimum 44px touch target
                "p-2.5 sm:p-3 sm:pr-4 md:pr-5",
                // Responsive gap
                "gap-1.5 sm:gap-2 md:gap-2.5",
                // Minimum touch target size for accessibility
                "min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0",
                isActive
                  ? "bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/20"
                  : "hover:bg-white/5 active:scale-95"
              )}
            >
              {/* Icon Container with Glow - Responsive sizes */}
              <div className={cn(
                "relative rounded-full overflow-hidden transition-transform duration-300",
                // Responsive icon sizes - larger for better visibility
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9",
                "group-hover:scale-110",
                isActive && "scale-105"
              )}>
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 24px, (max-width: 768px) 28px, 32px"
                />
              </div>

              {/* Label - Hidden on mobile, visible on sm and up */}
              <span className={cn(
                "font-medium tracking-wide whitespace-nowrap transition-colors duration-300",
                // Hide on mobile, show on sm+
                "hidden sm:inline",
                // Responsive text size
                "text-[10px] sm:text-xs",
                isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
              )}>
                {platform.name}
              </span>

              {/* Minimal Active Indicator Dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 sm:bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_currentColor] animate-pulse" />
              )}

              {/* Reflection/Shine effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
