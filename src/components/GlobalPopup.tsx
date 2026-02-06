
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Megaphone, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Popup = {
    id: number;
    title: string;
    type: "event" | "announcement" | "info";
    content: string | null;
    imageUrl: string | null;
};

export default function GlobalPopup() {
    const [popup, setPopup] = useState<Popup | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        async function fetchPopup() {
            try {
                console.log("Fetching popups...");
                const res = await fetch("/api/popups");
                if (!res.ok) {
                    console.error("Popup fetch failed:", res.status);
                    return;
                }

                const popups: Popup[] = await res.json();
                console.log("Popups fetched:", popups);

                if (popups.length > 0) {
                    const latest = popups[0];
                    const seen = sessionStorage.getItem(`seen_popup_${latest.id}`);
                    console.log("Latest popup:", latest.id, "Seen:", seen);

                    if (!seen) {
                        setPopup(latest);
                        setIsOpen(true);
                    }
                }
            } catch (e) { }
        }
        fetchPopup();
    }, []);

    // Countdown Logic
    const [canClose, setCanClose] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3);

    useEffect(() => {
        if (!isOpen) {
            setCanClose(false);
            setTimeLeft(3);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanClose(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const handleClose = () => {
        if (!canClose) return;
        setIsOpen(false);
        if (popup) {
            sessionStorage.setItem(`seen_popup_${popup.id}`, "true");
        }
    };

    if (!popup) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && canClose) handleClose();
        }}>
            <DialogContent className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 animate-fade-in-up top-auto translate-y-0 p-0 overflow-hidden border-none shadow-2xl bg-transparent flex flex-col items-center justify-center outline-none data-[state=open]:slide-in-from-bottom-12 data-[state=closed]:slide-out-to-bottom-12">
                <div className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden flex flex-col max-w-[90vw] sm:max-w-lg">

                    {/* Image Header if exists - Auto Height/Width */}
                    {popup.imageUrl && (
                        <div className="relative">
                            <img
                                src={popup.imageUrl}
                                alt={popup.title}
                                className="max-w-full max-h-[70vh] object-contain w-auto h-auto mx-auto block"
                            />

                            {/* Close Button Overlay */}
                            <div className="absolute top-2 right-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!canClose}
                                    className={`rounded-full shadow-md transition-all duration-300 w-8 h-8 ${canClose
                                        ? "bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                                        : "bg-black/20 text-white/50 cursor-not-allowed"}`}
                                    onClick={handleClose}
                                >
                                    {canClose ? <X className="w-5 h-5" /> : <span className="text-[10px] font-bold">{timeLeft}</span>}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Content Section (Optional) */}
                    {(popup.content || !popup.imageUrl) && (
                        <div className="p-6 relative">
                            {/* Close Button for No-Image implementation */}
                            {!popup.imageUrl && (
                                <div className="absolute top-2 right-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!canClose}
                                        onClick={handleClose}
                                        className={`rounded-full w-8 h-8 ${canClose ? "" : "opacity-50"}`}
                                    >
                                        {canClose ? <X className="w-4 h-4" /> : <span className="text-xs font-bold">{timeLeft}</span>}
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-3">
                                {popup.type === 'event' && <Calendar className="w-4 h-4 text-purple-500" />}
                                {popup.type === 'announcement' && <Megaphone className="w-4 h-4 text-amber-500" />}
                                {popup.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}

                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                                    ${popup.type === 'event' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                                    ${popup.type === 'announcement' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                                    ${popup.type === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                                `}>
                                    {popup.type}
                                </span>
                            </div>

                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold mb-2">
                                    {popup.title}
                                </DialogTitle>
                            </DialogHeader>

                            {popup.content && (
                                <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 max-h-[30vh] overflow-y-auto pr-2">
                                    {popup.content}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
