import { DataTable } from "./DataTable";

type ClientRow = {
  id: number | string;
  name?: string;
  phone?: string;
  email?: string;
  servicesCount?: number;
  activeServices?: number;
  totalTasks?: number;
  totalDocuments?: number;
};

type ClientTableProps = {
  rows: ClientRow[];
  onSelect?: (client: ClientRow) => void;
  selectedId?: number | string | null;
};

export function ClientTable({ rows, onSelect, selectedId }: ClientTableProps) {
  return (
    <DataTable
      title="Clients"
      rows={rows}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "client",
          header: "Client",
          render: (client) => (
            <button type="button" className="block text-left" onClick={() => onSelect?.(client)}>
              <div className="font-semibold text-slate-950">{client.name || "Client"}</div>
              <div className="mt-1 text-xs text-slate-500">{client.phone || "-"} | {client.email || "No email"}</div>
            </button>
          ),
        },
        {
          key: "services",
          header: "Services",
          render: (client) => <div>{client.activeServices || client.servicesCount || 0}</div>,
        },
        {
          key: "tasks",
          header: "Tasks",
          render: (client) => <div>{client.totalTasks || 0}</div>,
        },
        {
          key: "docs",
          header: "Documents",
          render: (client) => <div>{client.totalDocuments || 0}</div>,
        },
        {
          key: "highlight",
          header: "Focus",
          render: (client) => <div className={selectedId === client.id ? "font-semibold text-[var(--brand)]" : ""}>{selectedId === client.id ? "Selected" : "Ready"}</div>,
        },
      ]}
    />
  );
}
