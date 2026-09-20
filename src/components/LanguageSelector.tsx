"use client";

import { useState, useRef, useEffect } from "react";

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("IN"); // Default: Indonesia (IN)
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "IN", label: "Indonesia (IN)" },
    { code: "EN", label: "Inggris (EN)" },
    { code: "AR", label: "Arab (AR)" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-gray-300 transition-colors font-medium text-sm"
        title="Pilih Bahasa"
      >
        <span>{lang}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
                // Future integration: update i18n language here
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                lang === l.code
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
