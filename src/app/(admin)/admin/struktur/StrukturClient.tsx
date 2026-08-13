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
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold text-center text-blue-800 mb-6 border-b pb-4">Badan Pengurus Harian & Penasehat</h2>
        
        <div className="flex flex-col items-center space-y-8">
          {levels.map(level => (
            <div key={level} className="flex flex-wrap justify-center gap-6 w-full">
              {bphGrouped[level].map(member => (
                <div key={member.id} className="bg-blue-50 border border-blue-200 p-4 rounded-lg w-64 text-center shadow-sm">
                  <p className="font-bold text-gray-900">{member.name}</p>
                  <p className="text-sm font-semibold text-blue-700 mt-1">{member.position?.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Divisi / Bidang */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {divisions.map((div: any) => {
          const divMems = divisionMembers.filter((m: any) => m.divisionId === div.id);
          const divGrouped = groupByLevel(divMems);
          const divLevels = Object.keys(divGrouped).map(Number).sort((a, b) => a - b);
          
          return (
            <div key={div.id} className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-lg font-bold text-center text-green-700 border-b pb-3 mb-4">{div.name}</h3>
              
              <div className="flex flex-col items-center space-y-4">
                {divLevels.length === 0 && <p className="text-sm text-gray-400">Belum ada pengurus</p>}
                
                {divLevels.map(level => (
                  <div key={level} className="w-full space-y-3">
                    {divGrouped[level].map(member => (
                      <div key={member.id} className="bg-green-50 border border-green-200 p-3 rounded-lg text-center shadow-sm w-full">
                        <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                        <p className="text-xs font-semibold text-green-700 mt-1">{member.position?.name}</p>
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
