"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton"; // Import skeleton
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import type { Drama } from "@/types/drama";
import { cn } from "@/lib/utils";

interface DramaSectionProps {
  title: string;
  dramas?: Drama[];
  isLoading?: boolean;
  error?: boolean;    // New prop
  onRetry?: () => void; // New prop
}

export function DramaSection({ title, dramas, isLoading, error, onRetry }: DramaSectionProps) {
  if (error) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <UnifiedErrorDisplay
          title={`Gagal Memuat ${title}`}
          message="Tidak dapat mengambil data drama."
          onRetry={onRetry}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        {/* Title Skeleton */}
        <div className="h-7 md:h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-4" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up">
      <h2 className="font-display font-bold text-xl md:text-3xl text-gradient mb-6 tracking-tight">
        {title}
      </h2>

      {/* Bento Grid Layout - Asymmetrical */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dramas?.slice(0, 13).map((drama, index) => {
          // Normalize badge color
          const isPopular = drama.corner?.name?.toLowerCase().includes("populer");
          const badgeColor = isPopular ? "#E52E2E" : (drama.corner?.color || "#e5a00d");

          // Pattern Configuration:
          // Index 0: Featured Large (2x2)
          // Index 6: Wide Medium (2x1) 
          const isFeatured = index === 0;
          const isWide = index === 6;

          return (
            <div
              key={drama.bookId || `drama-${index}`}
              className={cn(
                "relative",
                isFeatured ? "col-span-2 row-span-2" : isWide ? "col-span-2" : "col-span-1"
              )}
            >
              <UnifiedMediaCard
                index={index}
                title={drama.bookName}
                cover={drama.coverWap || drama.cover || ""}
                link={`/detail/dramabox/${drama.bookId}`}
                episodes={drama.chapterCount}
                featured={isFeatured}
                topLeftBadge={drama.corner ? {
                  text: drama.corner.name,
                  color: badgeColor
                } : null}
                topRightBadge={drama.rankVo ? {
                  text: drama.rankVo.hotCode,
                  isTransparent: true
                } : null}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

