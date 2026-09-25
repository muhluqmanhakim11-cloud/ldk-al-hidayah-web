"use client";

import { useState } from "react";

export default function ProgramTimelineClient({ programs }: { programs: any[] }) {
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  if (programs.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-slate-900 border border-dashed rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada program</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Program kerja untuk periode ini belum dipublikasikan.</p>
      </div>
    );
  }

  // Group programs by division for a categorized timeline (optional) or just list them all
  // The user asked for "bulatan bulatan bergaris nyambung" like a roadmap.
  return (
    <div className="relative max-w-4xl mx-auto py-10">
      {/* Vertical line connecting the timeline */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-green-200 dark:bg-green-900/50 -translate-x-1/2 rounded-full"></div>

      <div className="space-y-12 relative z-10">
        {programs.map((program, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div key={program.id} className="relative flex items-center md:justify-between flex-col md:flex-row">
              
              {/* Circle Marker */}
              <div 
                className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-green-500 border-4 border-gray-50 dark:border-slate-950 shadow-md transform -translate-x-1/2 flex items-center justify-center z-20 cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setSelectedProgram(program)}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>

              {/* Content Box */}
              <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${isLeft ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12 text-left"}`}>
                <div 
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-slate-800 p-6 cursor-pointer group"
                  onClick={() => setSelectedProgram(program)}
                >
                  <div className={`flex flex-col ${isLeft ? "md:items-end" : "md:items-start"} mb-3`}>
                    <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block">
                      {program.division?.name || 'Umum'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {program.name}
                    </h3>
                  </div>
                  
                  {program.customStatus && (
                    <div className={`flex items-center gap-2 mb-3 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {program.customStatus}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className={`mt-4 text-green-600 dark:text-green-400 text-sm font-semibold flex items-center ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                    Lihat Detail 
                    <svg className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${isLeft ? "md:rotate-180 md:ml-0 md:mr-1 md:group-hover:-translate-x-1" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedProgram && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedProgram(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setSelectedProgram(null)}
                className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <div className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
                  {selectedProgram.division?.name || 'Umum'}
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                  {selectedProgram.name}
                </h2>
                
                {selectedProgram.customStatus && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Status: {selectedProgram.customStatus}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedProgram.schedule && (
                  <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Waktu Pelaksanaan</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProgram.schedule}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Deskripsi Program
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProgram.description || "Belum ada deskripsi."}
                  </p>
                </div>

                {selectedProgram.objective && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Tujuan
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedProgram.objective}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
