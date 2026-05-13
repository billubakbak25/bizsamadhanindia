import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  title: string;
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  getRowKey: (row: T) => string | number;
};

export function DataTable<T>({ title, columns, rows, emptyText = "No records found.", getRowKey }: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{rows.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={["px-5 py-3 font-semibold", column.className || ""].join(" ")}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length ? (
              rows.map((row) => (
                <tr key={getRowKey(row)} className="transition hover:bg-slate-50/70">
                  {columns.map((column) => (
                    <td key={column.key} className={["px-5 py-4 align-top text-slate-700", column.className || ""].join(" ")}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-slate-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
