"use client";

import { useEffect } from "react";

export default function PrintButton() {
  useEffect(() => {
    // Automatically open print dialog when page loads
    window.print();
  }, []);

  return (
    <button 
      onClick={() => window.print()} 
      className="print:hidden mb-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
    >
      Cetak Halaman Ini
    </button>
  );
}
