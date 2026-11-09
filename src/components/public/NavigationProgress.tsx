"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setVisible(true);
    setProgress(20);

    let current = 20;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 85) {
        current = 85;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(current);
    }, 120);
  };

  const finishProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  // Complete progress on pathname change
  useEffect(() => {
    finishProgress();
  }, [pathname]);

  // Global click listener to start progress immediately upon clicking internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchor hashes, downloads, new tabs, modifier keys
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if clicking current path
      const currentUrl = window.location.pathname;
      if (href === currentUrl) return;

      startProgress();
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none transition-all duration-300 ease-out shadow-[0_0_10px_rgba(74,222,128,0.8)]"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #22c55e, #86efac, #22c55e)",
        opacity: progress === 100 ? 0 : 1,
        transition: progress === 100 ? "width 0.15s ease, opacity 0.3s ease 0.1s" : "width 0.3s ease",
      }}
    />
  );
}
