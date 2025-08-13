/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/common/DataTable.tsx
import React, { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string; // Allow string for custom columns like 'select', 'actions'
  label: string | ReactNode; // Allow ReactNode for custom labels like checkboxes
  render?: (value: T[keyof T] | undefined, row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = "No data found",
  emptyDescription,
  onSort,
  className = ""
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const getCellValue = (row: T, columnKey: keyof T | string): T[keyof T] | undefined => {
    // For custom columns like 'select' or 'actions', return undefined
    // The render function will handle these
    if (typeof columnKey === 'string' && !(columnKey in row)) {
      return undefined;
    }
    return row[columnKey as keyof T];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && onSort?.(column.key as keyof T, 'asc')}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    {emptyDescription && (
                      <p className="mt-1 text-sm text-gray-400">{emptyDescription}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => {
                    const cellValue = getCellValue(row, column.key);
                    return (
                      <td 
                        key={String(column.key)} 
                        className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.render 
                          ? column.render(cellValue, row)
                          : cellValue
                        }
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}