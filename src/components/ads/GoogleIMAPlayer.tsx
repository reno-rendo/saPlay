"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleIMAPlayerProps {
    src: string;
    poster?: string;
    adTagUrl?: string | null; // VAST Tag URL
    className?: string;
    onEnded?: () => void;
}

export default function GoogleIMAPlayer({
    src,
    poster,
    adTagUrl,
    className = "",
    onEnded,
}: GoogleIMAPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const adContainerRef = useRef<HTMLDivElement>(null);
    const [adsManager, setAdsManager] = useState<any>(null);
    const [isAdPlaying, setIsAdPlaying] = useState(false);

    useEffect(() => {
        if (!adTagUrl || !videoRef.current || !adContainerRef.current) return;

        // Load Google IMA SDK
        const script = document.createElement("script");
        script.src = "//imasdk.googleapis.com/js/sdkloader/ima3.js";
        script.async = true;

        script.onload = () => {
            initIMA();
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            if (adsManager) {
                adsManager.destroy();
            }
        };
    }, [adTagUrl]);

    const initIMA = () => {
        const google = window.google;
        if (!google) return;

        const adDisplayContainer = new google.ima.AdDisplayContainer(
            adContainerRef.current,
            videoRef.current
        );
        adDisplayContainer.initialize();

        const adsLoader = new google.ima.AdsLoader(adDisplayContainer);

        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            (adsManagerLoadedEvent: any) => {
                const adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

                const manager = adsManagerLoadedEvent.getAdsManager(videoRef.current, adsRenderingSettings);
                setAdsManager(manager);

                manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
                    setIsAdPlaying(true);
                    videoRef.current?.pause();
                });

                manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
                    setIsAdPlaying(false);
                    videoRef.current?.play();
                });

                manager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
                    // Clean up if needed
                });

                try {
                    manager.init(
                        videoRef.current?.clientWidth || 640,
                        videoRef.current?.clientHeight || 360,
                        google.ima.ViewMode.NORMAL
                    );

                    manager.start();
                } catch (adError) {
                    console.error("Ad Manager init error:", adError);
                    videoRef.current?.play();
                }
            },
            false
        );

        adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            (adErrorEvent: any) => {
                console.error("IMA Ad Error:", adErrorEvent.getError());
                if (adsManager) {
                    adsManager.destroy();
                }
                videoRef.current?.play();
            },
            false
        );

        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adTagUrl;

        // Specify linear and nonlinear slot sizes. This helps the SDK to select the correct ad.
        adsRequest.linearAdSlotWidth = videoRef.current?.clientWidth || 640;
        adsRequest.linearAdSlotHeight = videoRef.current?.clientHeight || 360;
        adsRequest.nonLinearAdSlotWidth = videoRef.current?.clientWidth || 640;
        adsRequest.nonLinearAdSlotHeight = (videoRef.current?.clientHeight || 360) / 3;

        adsLoader.requestAds(adsRequest);
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (adsManager && videoRef.current) {
                adsManager.resize(
                    videoRef.current.clientWidth,
                    videoRef.current.clientHeight,
                    window.google.ima.ViewMode.NORMAL
                );
            }
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [adsManager]);


    return (
        <div className={`relative w-full h-full bg-black ${className}`}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                controls={!isAdPlaying}
                onEnded={onEnded}
                playsInline
            />

            <div
                ref={adContainerRef}
                className={`absolute inset-0 pointer-events-none ${isAdPlaying ? 'pointer-events-auto z-50' : 'z-[-1]'}`}
            />
        </div>
    );
}
