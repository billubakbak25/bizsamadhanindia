import { DataTable } from "./DataTable";

type LeadRow = {
  id: number | string;
  name?: string;
  service?: string;
  phone?: string;
  email?: string;
  status?: string;
  leadScore?: number;
  leadTemperature?: string;
  timestamp?: string;
  createdAt?: string;
};

type LeadTableProps = {
  rows: LeadRow[];
  onSelect?: (lead: LeadRow) => void;
  selectedId?: number | string | null;
};

function tone(status?: string) {
  const value = String(status || "new").toLowerCase();
  if (value === "converted") return "bg-emerald-50 text-emerald-700";
  if (value === "qualified") return "bg-sky-50 text-sky-700";
  if (value === "contacted") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function LeadTable({ rows, onSelect, selectedId }: LeadTableProps) {
  return (
    <DataTable
      title="Leads"
      rows={rows}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "lead",
          header: "Lead",
          render: (lead) => (
            <button type="button" className="block text-left" onClick={() => onSelect?.(lead)}>
              <div className="font-semibold text-slate-950">{lead.name || "Lead"}</div>
              <div className="mt-1 text-xs text-slate-500">Score {lead.leadScore || 0} | {lead.leadTemperature || "warm"}</div>
            </button>
          ),
        },
        {
          key: "service",
          header: "Service",
          render: (lead) => <div>{lead.service || "-"}</div>,
        },
        {
          key: "contact",
          header: "Contact",
          render: (lead) => (
            <div className="space-y-1">
              <div>{lead.phone || "-"}</div>
              <div className="text-xs text-slate-500">{lead.email || "No email"}</div>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (lead) => (
            <span className={["rounded-full px-3 py-1 text-xs font-semibold", tone(lead.status)].join(" ")}>
              {lead.status || "new"}
            </span>
          ),
        },
        {
          key: "createdAt",
          header: "Updated",
          render: (lead) => <div className={selectedId === lead.id ? "font-semibold text-[var(--brand)]" : ""}>{lead.timestamp || lead.createdAt || "-"}</div>,
        },
      ]}
    />
  );
}
