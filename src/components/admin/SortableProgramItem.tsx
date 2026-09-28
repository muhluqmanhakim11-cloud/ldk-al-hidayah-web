"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableProgramItem({ id, program }: { id: number; program: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm ${
        isDragging ? "shadow-lg border-blue-500 opacity-90 relative" : "hover:border-blue-300 transition-colors"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </button>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{program.name}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{program.division?.name || "-"}</span>
          <span>&bull;</span>
          <span>{program.customStatus || "-"}</span>
        </div>
      </div>
      
      <div className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {program.status}
      </div>
    </div>
  );
}
