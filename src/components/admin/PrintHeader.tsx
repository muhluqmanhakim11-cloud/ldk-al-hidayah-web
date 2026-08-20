import Image from "next/image";

interface PrintHeaderProps {
  title: string;
}

export default function PrintHeader({ title }: PrintHeaderProps) {
  return (
    <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {/* You can replace this with actual logo */}
            <span className="font-bold text-xl text-gray-500">LDK</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">LDK Al-Hidayah STMIK IKMI CIREBON</h2>
            <p className="text-sm text-gray-600">Gedung Student Center STMIK IKMI CIREBON</p>
            <p className="text-sm text-gray-600">Email: halo@ldkalhidayah.com | Instagram: @ldkalhidayah</p>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold underline uppercase">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
