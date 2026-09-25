"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start progress bar on route change
    setVisible(true);
    setProgress(0);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 90) {
        current = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(current);
    }, 120);

    // Complete after short delay
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(74,222,128,0.8)]"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #22c55e, #86efac, #22c55e)",
        opacity: progress === 100 ? 0 : 1,
        transition: progress === 100 ? "width 0.2s ease, opacity 0.4s ease 0.1s" : "width 0.3s ease",
      }}
    />
  );
}
