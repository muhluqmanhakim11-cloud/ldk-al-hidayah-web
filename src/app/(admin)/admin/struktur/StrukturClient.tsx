"use client";

export default function StrukturClient({ members, divisions, positions }: any) {
  
  const bphMembers = members.filter((m: any) => !m.divisionId);
  const divisionMembers = members.filter((m: any) => m.divisionId);

  // Helper to group by level
  const groupByLevel = (membersArray: any[]) => {
    const grouped: Record<number, any[]> = {};
    membersArray.forEach(m => {
      const lvl = m.position?.level || 99;
      if (!grouped[lvl]) grouped[lvl] = [];
      grouped[lvl].push(m);
    });
    return grouped;
  };

  const bphGrouped = groupByLevel(bphMembers);
  const levels = Object.keys(bphGrouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {/* BPH (Badan Pengurus Harian) & Penasehat */}
      <div className="bg-gradient-to-b from-blue-50/50 to-white p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50 -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-extrabold text-center text-blue-900 mb-8 border-b border-blue-200/60 pb-5">Badan Pengurus Harian & Penasehat</h2>
          
          <div className="flex flex-col items-center space-y-10">
            {levels.map((level, idx) => (
              <div key={level} className="flex flex-col items-center w-full">
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
                  {bphGrouped[level].map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 border border-blue-100 p-5 rounded-xl w-full sm:w-64 text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{member.name}</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 line-clamp-1">{member.position?.name}</p>
                    </div>
                  ))}
                </div>
                {/* Connecting Line (except last level) */}
                {idx < levels.length - 1 && (
                  <div className="w-px h-8 bg-blue-200 mt-6 hidden sm:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divisi / Bidang */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((div: any) => {
          const divMems = divisionMembers.filter((m: any) => m.divisionId === div.id);
          const divGrouped = groupByLevel(divMems);
          const divLevels = Object.keys(divGrouped).map(Number).sort((a, b) => a - b);
          
          return (
            <div key={div.id} className="bg-white dark:bg-slate-900 hover:bg-emerald-50/20 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-full blur-2xl opacity-40 -mr-5 -mt-5 pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-center text-emerald-800 border-b border-gray-100 dark:border-slate-800 pb-4 mb-5 flex items-center justify-center">
                {div.name}
              </h3>
              
              <div className="flex flex-col items-center space-y-4 flex-grow">
                {divLevels.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada pengurus</p>
                  </div>
                )}
                
                {divLevels.map(level => (
                  <div key={level} className="w-full space-y-3">
                    {divGrouped[level].map(member => (
                      <div key={member.id} className="bg-white dark:bg-slate-900 border border-emerald-100/80 p-3.5 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-300 transition-all group">
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm group-hover:text-emerald-900 transition-colors">{member.name}</p>
                        <div className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md mt-2">
                          {member.position?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
