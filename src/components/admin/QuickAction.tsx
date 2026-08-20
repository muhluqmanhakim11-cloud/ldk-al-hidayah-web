import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  title: string;
  href: string;
  icon: LucideIcon;
}

export default function QuickAction({ title, href, icon: Icon }: QuickActionProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-3 group-hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
        <Icon size={24} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{title}</span>
    </Link>
  );
}
