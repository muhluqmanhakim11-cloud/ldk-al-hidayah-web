"use client";
import { useState, useEffect } from "react";

export default function JadwalSholat() {
  const [jadwal, setJadwal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchJadwal() {
      try {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        
        // ID 1206 = Kota Cirebon
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1206/${year}/${month}/${day}`);
        const data = await res.json();
        
        if (data.status) {
          setJadwal(data.data.jadwal);
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal sholat:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJadwal();
  }, []);

  const prayers = [
    { name: "Subuh", time: jadwal?.subuh },
    { name: "Dzuhur", time: jadwal?.dzuhur },
    { name: "Ashar", time: jadwal?.ashar },
    { name: "Maghrib", time: jadwal?.maghrib },
    { name: "Isya", time: jadwal?.isya },
  ];

  let nextPrayer: any = null;
  let countdownStr = "";

  if (jadwal) {
    for (let p of prayers) {
      if (!p.time) continue;
      const [h, m] = p.time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(h), parseInt(m), 0, 0);

      if (currentTime < prayerTime) {
        nextPrayer = { ...p, date: prayerTime };
        break;
      }
    }

    if (!nextPrayer && jadwal.subuh) {
      const [h, m] = jadwal.subuh.split(':');
      const tomorrowSubuh = new Date();
      tomorrowSubuh.setDate(tomorrowSubuh.getDate() + 1);
      tomorrowSubuh.setHours(parseInt(h), parseInt(m), 0, 0);
      nextPrayer = { name: "Subuh", time: jadwal.subuh, date: tomorrowSubuh };
    }

    if (nextPrayer) {
      const diff = nextPrayer.date.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        countdownStr = `-${hours}j ${mins}m ${secs}d menuju ${nextPrayer.name}`;
      } else if (mins > 0) {
        countdownStr = `-${mins}m ${secs}d menuju ${nextPrayer.name}`;
      } else {
        countdownStr = `-${secs}d menuju ${nextPrayer.name}`;
      }
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  };

  return (
    <div className="relative z-30 -mt-12 flex justify-center w-full px-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-green-900/10 border border-white/60 rounded-3xl p-5 md:p-6 flex flex-col items-center gap-5 overflow-hidden max-w-5xl mx-auto w-full transition-all">
        
        {/* Bagian Atas: Waktu & Info Lokasi */}
        <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">Jadwal Sholat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{jadwal ? jadwal.tanggal : "Memuat..."} • Karyamulya, Cirebon</p>
            </div>
          </div>

          {mounted && (
            <div className="flex flex-col items-center md:items-end bg-green-50 dark:bg-green-900/30/80 border border-green-200/50 rounded-2xl px-5 py-2.5 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-green-800 tracking-wider font-mono">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs font-semibold text-green-600 uppercase">WIB</span>
              </div>
              {countdownStr && (
                <div className="text-sm font-bold text-orange-500 mt-1 flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {countdownStr}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Garis Pembatas */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Bagian Bawah: List Jadwal */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex justify-between items-center min-w-max md:w-full gap-3 md:gap-6 px-2">
            {prayers.map((sholat) => {
              const isNext = nextPrayer?.name === sholat.name;
              return (
                <div key={sholat.name} className={`flex flex-col items-center px-4 py-3 rounded-2xl transition-all duration-300 min-w-[85px] ${isNext ? 'bg-green-600 shadow-lg shadow-green-600/30 text-white transform -translate-y-1' : 'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950'}`}>
                  <span className={`text-[11px] md:text-xs font-bold uppercase tracking-wider ${isNext ? 'text-green-100' : 'text-gray-400'}`}>
                    {sholat.name}
                  </span>
                  <span className={`text-lg md:text-xl font-black mt-1 ${isNext ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    {loading ? "--:--" : sholat.time || "--:--"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
