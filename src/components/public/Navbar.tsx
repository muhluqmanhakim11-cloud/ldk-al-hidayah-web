"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Profil", path: "/profil" },
    { name: "Pengurus", path: "/struktur" },
    { name: "Program Kerja", path: "/program-kerja" },
    { name: "Kegiatan", path: "/kegiatan" },
    { name: "Berita", path: "/berita" },
    { name: "Galeri", path: "/galeri" },
  ];

  return (
    <>
      <nav 
        className={`fixed inset-x-0 mx-auto z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? "top-4 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-md rounded-full py-2.5" 
            : "top-8 w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] max-w-7xl bg-white/95 backdrop-blur-md border border-white/50 shadow-xl rounded-full py-3.5"
        }`}
      >
        <div className="px-6 md:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${scrolled ? 'bg-green-700 text-white' : 'bg-green-600 text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <span className={`font-bold text-lg md:text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                LDK Al-Hidayah
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                return (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? "bg-green-100 text-green-800" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    } active:scale-95`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`lg:hidden p-2.5 rounded-full transition-colors ${isOpen ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown (Glassmorphism) */}
      <div className={`fixed inset-x-4 top-24 lg:hidden z-40 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'max-h-[500px] opacity-100 pointer-events-auto shadow-2xl rounded-3xl' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 px-6 py-8 flex flex-col space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-2xl text-base font-bold transition-colors ${
                  isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
