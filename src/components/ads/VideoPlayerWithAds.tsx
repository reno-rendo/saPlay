
"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, SkipForward, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define Ad Type locally to avoid import loops if schema is server-only (though safe for types usually)
export type Ad = {
    id: number;
    title: string;
    type: "preroll" | "midroll" | "postroll";
    category: "skippable" | "non_skippable" | "bumper";
    videoUrl: string;
    linkUrl: string | null;
    duration: number;
    skipAfter: number | null;
    isActive: boolean | null;
};

interface VideoPlayerWithAdsProps {
    src: string;
    poster?: string;
    ads: Ad[];
    onEnded?: () => void;
    autoPlay?: boolean;
    className?: string; // To support external styling
}

export default function VideoPlayerWithAds({
    src,
    poster,
    ads,
    onEnded,
    autoPlay = false,
    className = ""
}: VideoPlayerWithAdsProps) {
    const [playbackState, setPlaybackState] = useState<"preroll" | "content" | "postroll">("preroll");
    const [currentAd, setCurrentAd] = useState<Ad | null>(null);
    const [canSkip, setCanSkip] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [adEnded, setAdEnded] = useState(false); // To prevent loop if ad is short

    const videoRef = useRef<HTMLVideoElement>(null);
    const adVideoRef = useRef<HTMLVideoElement>(null);

    // Initialize ads
    useEffect(() => {
        // Filter active ads
        const activeAds = ads.filter(a => a.isActive);
        const prerolls = activeAds.filter(a => a.type === "preroll");

        if (prerolls.length > 0) {
            // Pick one random preroll
            const randomAd = prerolls[Math.floor(Math.random() * prerolls.length)];
            setCurrentAd(randomAd);
            setPlaybackState("preroll");
            setTimeLeft(randomAd.duration);
            setCanSkip(false);
        } else {
            setPlaybackState("content");
        }
    }, [ads, src]); // Re-run if source changes (new episode)

    // Handle Ad Progress
    const handleAdTimeUpdate = () => {
        if (!adVideoRef.current || !currentAd) return;

        const currentTime = adVideoRef.current.currentTime;
        const remaining = Math.ceil(currentAd.duration - currentTime);
        setTimeLeft(remaining);

        // Bumper ads are never skippable
        if (currentAd.category === "bumper") return;

        if (currentAd.skipAfter && currentTime >= currentAd.skipAfter) {
            setCanSkip(true);
        }
    };

    const skipAd = () => {
        setPlaybackState("content");
        setCurrentAd(null);
    };

    const handleAdEnded = () => {
        setPlaybackState("content");
        setCurrentAd(null);
    };

    // Main Content Logic
    // When switching to content, ensure it plays if autoPlay was on or if coming from ad
    useEffect(() => {
        if (playbackState === "content" && videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, [playbackState]);

    const handleContentEnded = () => {
        // Check for Postroll
        const activeAds = ads.filter(a => a.isActive);
        const postrolls = activeAds.filter(a => a.type === "postroll");

        if (postrolls.length > 0) {
            const randomAd = postrolls[Math.floor(Math.random() * postrolls.length)];
            setCurrentAd(randomAd);
            setPlaybackState("postroll");
            setCanSkip(false);
        } else {
            onEnded?.();
        }
    };

    if (playbackState === "preroll" && currentAd) {
        return (
            <div className={`relative bg-black w-full h-full flex items-center justify-center ${className}`}>
                <video
                    ref={adVideoRef}
                    src={currentAd.videoUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    onTimeUpdate={handleAdTimeUpdate}
                    onEnded={handleAdEnded}
                // Disable controls for ads usually
                />

                {/* Ad UI Overlay */}
                <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
                    <div className="bg-black/60 text-white px-3 py-1 rounded text-xs font-medium backdrop-blur-sm">
                        Iklan &bull; {timeLeft}s
                    </div>

                    {canSkip ? (
                        <Button onClick={skipAd} variant="secondary" className="gap-2 bg-white/90 hover:bg-white text-black font-bold">
                            Skip Ad <SkipForward className="w-4 h-4" />
                        </Button>
                    ) : (
                        currentAd.category !== "bumper" && currentAd.category !== "non_skippable" && currentAd.skipAfter && (
                            <div className="bg-black/60 text-white/80 px-3 py-1 rounded text-xs backdrop-blur-sm">
                                Skip dalam {Math.ceil(currentAd.skipAfter - (adVideoRef.current?.currentTime || 0))}s
                            </div>
                        )
                    )}
                </div>

                {/* Click-through Link */}
                {currentAd.linkUrl && (
                    <div className="absolute bottom-8 left-4 z-50">
                        <a
                            href={currentAd.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            Kunjungi Website <SkipForward className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>
        );
    }

    if (playbackState === "postroll" && currentAd) {
        return (
            <div className={`relative bg-black w-full h-full flex items-center justify-center ${className}`}>
                <video
                    ref={adVideoRef}
                    src={currentAd.videoUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    onEnded={() => {
                        setCurrentAd(null);
                        setPlaybackState("content"); // Effectively ends it
                        onEnded?.();
                    }}
                />
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-xs">
                    Post-roll Ad
                </div>
            </div>
        );
    }

    // Main Content
    return (
        <video
            ref={videoRef}
            src={src}
            poster={poster}
            className={`w-full h-full object-contain ${className}`}
            controls
            autoPlay={autoPlay}
            playsInline
            onEnded={handleContentEnded}
        />
    );
}
