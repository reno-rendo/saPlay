
"use client";

import { useEffect, useState } from "react";

// Helper type for the ad object
export type AdScript = {
    id: number;
    title: string;
    code: string;
    position: string;
};

interface AdScriptRendererProps {
    position: string;
    className?: string;
}

export default function AdScriptRenderer({ position, className = "" }: AdScriptRendererProps) {
    const [scripts, setScripts] = useState<AdScript[]>([]);

    useEffect(() => {
        async function fetchScripts() {
            try {
                // Fetch all scripts (or filter by position via API query param to be more efficient)
                const res = await fetch(`/api/scripts?position=${position}`);
                if (res.ok) {
                    const data = await res.json();
                    setScripts(data);
                }
            } catch (e) {
                console.error("Failed to load scripts", e);
            }
        }
        fetchScripts();
    }, [position]);

    if (scripts.length === 0) return null;

    return (
        <div className={`ad-container ad-${position} ${className}`}>
            {scripts.map((script) => (
                <div key={script.id} className="ad-slot my-4" dangerouslySetInnerHTML={{ __html: script.code }} />
            ))}
        </div>
    );
}
