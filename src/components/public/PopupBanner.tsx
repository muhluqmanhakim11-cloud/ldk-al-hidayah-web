"use client";

import { useState, useEffect } from "react";

interface PopupBannerProps {
  imageUrl: string;
  duration: number;
}

export default function PopupBanner({ imageUrl, duration }: PopupBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
    if (!hasSeenPopup && imageUrl) {
      setIsOpen(true);
      sessionStorage.setItem("hasSeenPopup", "true");
    }
  }, [imageUrl]);

  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft <= 0) {
      setIsOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative max-w-4xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-12 right-0 md:-right-12 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white rounded-full p-2 transition-colors flex items-center justify-center backdrop-blur-md border border-white/20"
          aria-label="Tutup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <img 
          src={imageUrl} 
          alt="Pengumuman LDK Al-Hidayah" 
          className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
        
        <div className="mt-4 bg-black/50 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-md">
          Tertutup otomatis dalam {timeLeft} detik
        </div>
      </div>
    </div>
  );
}
