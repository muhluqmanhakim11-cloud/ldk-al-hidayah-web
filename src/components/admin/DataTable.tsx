import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  canEdit?: (row: T) => boolean;
  canDelete?: (row: T) => boolean;
  searchPlaceholder?: string;
}

export default function DataTable<T extends { id: number | string }>({ 
  data, columns, onEdit, onDelete, canEdit, canDelete 
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-sm">
        Data belum tersedia.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-sm">
      <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3">{col.header}</th>
            ))}
            {(onEdit || onDelete) && <th className="px-6 py-3 text-right">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
              {columns.map((col, idx) => (
                <td key={idx} className="px-6 py-4">
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-right space-x-2">
                  {onEdit && (!canEdit || canEdit(row)) && (
                    <button 
                      onClick={() => onEdit(row)} 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (!canDelete || canDelete(row)) && (
                    <button 
                      onClick={() => onDelete(row)} 
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
