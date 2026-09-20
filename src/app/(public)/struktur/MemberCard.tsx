"use client";

import { useState } from "react";
import Image from "next/image";

type MemberProps = {
  member: {
    id: number;
    name: string;
    photoUrl?: string | null;
    position?: { name: string } | null;
  };
  className?: string;
  nameClassName?: string;
  positionClassName?: string;
};

export default function MemberCard({ member, className = "", nameClassName = "", positionClassName = "" }: MemberProps) {
  const [show, setShow] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isRightSide, setIsRightSide] = useState(false);
  const [isBottom, setIsBottom] = useState(false);

  // Desktop hover
  const updatePos = (e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setIsRightSide(e.clientX > window.innerWidth / 2);
    setIsBottom(e.clientY > window.innerHeight - 350); // 350px buffer for the popup height
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (member.photoUrl) {
      setShow(true);
      updatePos(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (member.photoUrl) updatePos(e);
  };

  const handleMouseLeave = () => setShow(false);

  // Mobile tap
  const handleTap = (e: React.TouchEvent) => {
    if (!member.photoUrl) return;
    e.preventDefault();
    setIsMobileOpen(prev => !prev);
  };

  return (
    <>
      <div
        className={`relative ${className} ${member.photoUrl ? "cursor-pointer" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleTap}
      >
        <h3 className={`${nameClassName} ${member.photoUrl ? "underline decoration-dotted decoration-green-500 underline-offset-2 select-none" : ""}`}>
          {member.name}
          {member.photoUrl && (
            <span className="ml-1 text-green-500 text-xs">📷</span>
          )}
        </h3>
        <p className={positionClassName}>{member.position?.name}</p>

        {/* Desktop hover popup (muncul menyesuaikan kursor) */}
        {show && member.photoUrl && (
          <div
            className="fixed z-[9999] pointer-events-none hidden md:block"
            style={{
              left: isRightSide ? undefined : pos.x + 20,
              right: isRightSide ? window.innerWidth - pos.x + 20 : undefined,
              top: isBottom ? pos.y - 320 : pos.y - 50,
              animation: "fadeSlideIn 0.2s ease-out forwards",
            }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden w-[240px]">
              <div className="relative w-[240px] h-[300px]">
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="px-2 py-1.5 text-center">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{member.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile tap modal */}
      {isMobileOpen && member.photoUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center md:hidden"
          style={{ animation: "fadeSlideIn 0.2s ease-out forwards" }}
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden w-64 z-10">
            <div className="relative w-64 h-80">
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="px-3 py-2 text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{member.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Ketuk untuk menutup</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-6px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </>
  );
}
