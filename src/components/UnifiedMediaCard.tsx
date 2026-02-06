"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeConfig {
  text: string;
  color?: string;
  textColor?: string;
  isTransparent?: boolean;
}

export interface UnifiedMediaCardProps {
  title: string;
  cover: string;
  link: string;
  episodes?: number;
  topLeftBadge?: BadgeConfig | null;
  topRightBadge?: BadgeConfig | null;
  index?: number;
  featured?: boolean; // New prop for bento grid featured items
}

export function UnifiedMediaCard({
  title,
  cover,
  link,
  episodes = 0,
  topLeftBadge,
  topRightBadge,
  index = 0,
  featured = false,
}: UnifiedMediaCardProps) {

  return (
    <Link
      href={link}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-card border border-white/5 shadow-2xl transition-all duration-500 hover:shadow-primary/20",
        featured ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[2/3]"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container - Scales on Hover */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={cover.includes(".heic")
            ? `https://wsrv.nl/?url=${encodeURIComponent(cover)}&output=jpg`
            : cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-overlay" />
      </div>

      {/* Content Layer - Positioned Absolute Bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 flex flex-col justify-end h-full">

        {/* Badges - Top Positioned but inside content layer context if needed, or top absolute */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          {/* Top Left Badge */}
          <div>
            {topLeftBadge && (
              <span
                className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm backdrop-blur-md"
                style={{
                  backgroundColor: topLeftBadge.color || "#E52E2E",
                  color: topLeftBadge.textColor || "#FFFFFF"
                }}
              >
                {topLeftBadge.text}
              </span>
            )}
          </div>

          {/* Top Right Badge */}
          <div>
            {topRightBadge && (
              <span
                className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm backdrop-blur-md bg-black/40 text-white border border-white/10"
              >
                {topRightBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* Play Button - Centered but appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play className="w-5 h-5 md:w-8 md:h-8 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {episodes > 0 && (
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-white/80">
              <Play className="w-3 h-3 fill-white/80" />
              <span>{episodes} Episode</span>
            </div>
          )}

          <h3 className={cn(
            "font-display font-bold text-white leading-tight drop-shadow-lg group-hover:text-primary transition-colors duration-300",
            featured ? "text-2xl md:text-4xl max-w-2xl" : "text-lg md:text-xl line-clamp-2"
          )}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
