import { DataTable } from "./DataTable";

type ServiceRow = {
  id: number | string;
  name?: string;
  serviceName?: string;
  serviceCode?: string;
  categoryLabel?: string;
  status?: string;
  currentStepCode?: string;
  documentCount?: number;
  taskSummary?: {
    total?: number;
    assigned?: number;
    inProgress?: number;
    completed?: number;
    overdue?: number;
  };
  updatedAt?: string;
};

type ServiceTableProps = {
  rows: ServiceRow[];
  onSelect?: (service: ServiceRow) => void;
  selectedId?: number | string | null;
};

function statusTone(status?: string) {
  const value = String(status || "pending").toLowerCase();
  if (value === "completed") return "bg-emerald-50 text-emerald-700";
  if (value === "in_progress") return "bg-sky-50 text-sky-700";
  if (value === "submitted") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function ServiceTable({ rows, onSelect, selectedId }: ServiceTableProps) {
  return (
    <DataTable
      title="Services"
      rows={rows}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "service",
          header: "Service",
          render: (service) => (
            <button type="button" className="block text-left" onClick={() => onSelect?.(service)}>
              <div className="font-semibold text-slate-950">{service.name || service.serviceName || "Service"}</div>
              <div className="mt-1 text-xs text-slate-500">{service.serviceCode || "code"} | {service.categoryLabel || "Category"}</div>
            </button>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (service) => (
            <span className={["rounded-full px-3 py-1 text-xs font-semibold", statusTone(service.status)].join(" ")}>
              {service.status || "pending"}
            </span>
          ),
        },
        {
          key: "step",
          header: "Step",
          render: (service) => <div>{service.currentStepCode || "-"}</div>,
        },
        {
          key: "summary",
          header: "Tasks / docs",
          render: (service) => (
            <div>
              {service.taskSummary?.total || 0} tasks | {service.documentCount || 0} docs
              <div className="text-xs text-slate-500">{service.taskSummary?.overdue || 0} overdue</div>
            </div>
          ),
        },
        {
          key: "updatedAt",
          header: "Updated",
          render: (service) => <div className={selectedId === service.id ? "font-semibold text-[var(--brand)]" : ""}>{service.updatedAt || "-"}</div>,
        },
      ]}
    />
  );
}
