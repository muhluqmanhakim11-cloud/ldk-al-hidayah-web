"use client";

import { useState, useEffect } from "react";

export default function BMKGClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    // Sync time offset with server to guarantee exact time regardless of local PC wrong clock
    fetch("/api/admin/time")
      .then(res => res.json())
      .then(data => {
        if (data.serverTime) {
          const calculatedOffset = data.serverTime - Date.now();
          setOffset(calculatedOffset);
        }
      })
      .catch(() => console.error("Failed to sync clock offset"));
  }, []);

  useEffect(() => {
    setTime(new Date(Date.now() + offset));
    const interval = setInterval(() => {
      setTime(new Date(Date.now() + offset));
    }, 1000);
    return () => clearInterval(interval);
  }, [offset]);

  if (!time) return <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />;

  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta"
  });
  
  const formatted = formatter.format(time).replace(/\./g, ":");

  return (
    <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm text-white mr-4">
      <span className="text-[10px] font-medium opacity-80 mb-0.5 leading-none">Waktu Server (WIB)</span>
      <span className="text-sm font-bold tracking-wider leading-none">{formatted}</span>
    </div>
  );
}
