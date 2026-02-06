"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

export default function NativeAdCard({ index }: { index: number }) {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Here you would typically inject a script or initialize an ad slot
        // For example, if using Google Ad Manager Native Ads:
        // window.googletag.cmd.push(() => { window.googletag.display('div-gpt-ad-generic'); });

        // For this implementation, we'll placeholder it or allow custom script injection logic later
        // if the user wants to fetch 'native_grid' scripts from ad_scripts table.
    }, []);

    return (
        <Card className="group relative overflow-hidden bg-gray-50 dark:bg-zinc-900 border-none shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-mono">ADVERTISEMENT</span>

                {/* Placeholder for Ad content injection */}
                <div ref={adContainerRef} className="absolute inset-0 flex items-center justify-center">
                    {/* If implementing image based ads later */}
                    {/* <img src="..." className="w-full h-full object-cover" /> */}
                </div>
            </div>

            <CardContent className="p-3 space-y-1.5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-200">
                        Sponsored
                    </Badge>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2group-hover:text-primary transition-colors">
                    Sponsor Content
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    Check out this offer
                </p>
            </CardContent>
        </Card>
    );
}
