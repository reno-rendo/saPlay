import { Sparkles, TrendingUp, Clock, Play, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  description: string;
  icon?: "sparkles" | "trending" | "clock" | "play";
}

const icons = {
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
  play: Play,
};

export function HeroSection({ title, description, icon = "sparkles" }: HeroSectionProps) {
  const IconComponent = icons[icon];

  return (
    <div className="relative min-h-[40vh] flex items-center justify-center overflow-hidden py-24">
      {/* Cinematic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Massive Ambient Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-primary/10 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />

        {/* Animated Particles/Noise handled by global CSS, but adding specific accent blobs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="relative container mx-auto px-4 text-center z-10">

        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 animate-fade-in-up">
          <IconComponent className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
            {icon === "trending" ? "Sedang Hangat" : "Pilihan Editor"}
          </span>
        </div>

        {/* Massive Title */}
        <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-6 drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {description}
        </p>

        {/* Decorative Scroll indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-24 animate-bounce opacity-50">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </div>
    </div>
  );
}
