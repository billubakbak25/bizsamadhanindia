import { Card } from "@/components/ui/Card";

type TaskRow = {
  id: number | string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedStaffName?: string;
  assignedStaffId?: string;
  serviceCode?: string;
  serviceName?: string;
  slaDueAt?: string;
  sla_status?: string;
};

type TaskKanbanProps = {
  tasks: TaskRow[];
  onSelect?: (task: TaskRow) => void;
  onStatusChange?: (task: TaskRow, status: string) => void;
};

const STATUS_COLUMNS = [
  { key: "assigned", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

function normalizeStatus(status?: string) {
  const value = String(status || "assigned").toLowerCase();
  if (value === "done") return "completed";
  return value;
}

function taskTone(task: TaskRow) {
  if (task.sla_status === "breached") return "text-rose-700 bg-rose-50";
  if (task.status === "completed") return "text-emerald-700 bg-emerald-50";
  if (task.status === "in_progress") return "text-sky-700 bg-sky-50";
  return "text-slate-700 bg-slate-100";
}

export function TaskKanban({ tasks, onSelect, onStatusChange }: TaskKanbanProps) {
  const columns = STATUS_COLUMNS.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => normalizeStatus(task.status) === column.key),
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => (
        <Card key={column.key} className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{column.label}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{column.tasks.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {column.tasks.length ? column.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm">
                <button type="button" className="block w-full text-left" onClick={() => onSelect?.(task)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{task.title || "Task"}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.serviceName || task.serviceCode || "Service"}</p>
                    </div>
                    <span className={["rounded-full px-3 py-1 text-xs font-semibold", taskTone(task)].join(" ")}>
                      {String(task.sla_status || task.status || "assigned").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-slate-600">{task.description || "No description provided."}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{task.assignedStaffName || task.assignedStaffId || "Unassigned"}</p>
                </button>
                {onStatusChange ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {STATUS_COLUMNS.map((next) => (
                      <button
                        key={next.key}
                        type="button"
                        onClick={() => onStatusChange(task, next.key)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      >
                        {next.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">No tasks in this lane.</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
