
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { autoAssignAdminTasks, fetchAdminOverdueTasks, fetchAdminTasks, updateAdminTaskStatus, type AdminRecord } from "@/lib/adminData";
import { EmptyState, Panel, StatusBadge, SummaryCard, formatDateTime } from "./shared";

const STATUS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in progress", label: "In Progress" },
  { key: "submitted", label: "Submitted" },
  { key: "completed", label: "Done" },
];

function taskIdOf(task: AdminRecord) {
  return String(task.id ?? task._id ?? task.taskId ?? "");
}

function taskSearchText(task: AdminRecord) {
  return [task.title, task.name, task.status, task.priority, task.assignee_name, task.assigneeName, task.service_name, task.serviceName].filter(Boolean).join(" ").toLowerCase();
}

function statusBucket(task: AdminRecord) {
  const normalized = String(task.status ?? task.stage ?? task.state ?? "todo").toLowerCase();
  if (normalized.includes("complete") || normalized.includes("done")) {
    return "completed";
  }
  if (normalized.includes("submit")) {
    return "submitted";
  }
  if (normalized.includes("progress") || normalized.includes("working")) {
    return "in progress";
  }
  return "todo";
}

function isBreached(task: AdminRecord) {
  return String(task.sla_status ?? task.slaStatus ?? "").toLowerCase() === "breached";
}

export function TasksModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "table">("board");
  const [tasks, setTasks] = useState<AdminRecord[]>([]);
  const [overdue, setOverdue] = useState<AdminRecord[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskResult, overdueResult] = await Promise.all([fetchAdminTasks({ search, limit: 150 }), fetchAdminOverdueTasks()]);
      setTasks(taskResult.items);
      setOverdue(overdueResult);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTasks = useMemo(() => tasks.filter((task) => taskSearchText(task).includes(search.toLowerCase())), [tasks, search]);
  const columnMap = useMemo(() => {
    return STATUS_COLUMNS.reduce<Record<string, AdminRecord[]>>((accumulator, column) => {
      accumulator[column.key] = visibleTasks.filter((task) => statusBucket(task) === column.key);
      return accumulator;
    }, {});
  }, [visibleTasks]);

  async function runAutoAssign() {
    setLoading(true);
    try {
      await autoAssignAdminTasks({ reason: "admin-panel" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function moveTask(taskId: string, nextStatus: string) {
    await updateAdminTaskStatus(taskId, nextStatus, { source: "admin-panel" });
    await load();
  }

  return (
    <div className="space-y-6">
      <Panel
        eyebrow="Task management"
        title="Kanban and table views"
        description="Track assignment, deadlines, SLA breaches, and completion across the operational queue."
        actions={(
          <>
            <button type="button" onClick={() => void runAutoAssign()} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15">Auto-assign</button>
            <button type="button" onClick={() => setView((current) => current === "board" ? "table" : "board")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30">{view === "board" ? "Table view" : "Kanban view"}</button>
            <button type="button" onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30">Refresh</button>
          </>
        )}
      >
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Tasks" value={String(visibleTasks.length)} caption="Current workload" />
          <SummaryCard label="Overdue" value={String(overdue.length)} caption="Requires escalation" accent="rose" />
          <SummaryCard label="View" value={view === "board" ? "Kanban" : "Table"} caption="Operator preference" accent="amber" />
        </div>
      </Panel>

      <Panel eyebrow="Search and SLA" title="Operational queue" description="Tasks with breached SLA windows are visually highlighted.">
        <label className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Task, service, assignee..." />
        </label>
      </Panel>

      {view === "board" ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {STATUS_COLUMNS.map((column) => (
            <Panel key={column.key} eyebrow={column.label} title={`${columnMap[column.key].length} items`} description="Explicit status buttons keep the flow simple and queue-ready.">
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[18px] border border-white/10 bg-white/[0.04]" />)
                ) : columnMap[column.key].length ? (
                  columnMap[column.key].map((task) => {
                    const taskId = taskIdOf(task);
                    const breached = isBreached(task);
                    return (
                      <div key={taskId || task.title} className={`rounded-[20px] border px-4 py-4 ${breached ? "border-rose-400/40 bg-rose-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{task.title ?? task.name ?? "Task"}</p>
                            <p className="mt-1 text-sm text-slate-300">{task.service_name ?? task.serviceName ?? task.assignee_name ?? task.assigneeName ?? "Assignment"}</p>
                          </div>
                          <StatusBadge status={task.sla_status ?? task.status ?? "todo"} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {STATUS_COLUMNS.map((target) => (
                            <button key={target.key} type="button" onClick={() => void moveTask(taskId, target.key)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:border-emerald-400/40">
                              {target.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-slate-400">Due {formatDateTime(task.dueAt ?? task.due_at ?? task.deadline)}</p>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title={`No ${column.label.toLowerCase()} tasks`} description="This column is empty for the current filter." />
                )}
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel eyebrow="Table view" title="All tasks" description="A compact operational table with assignee and deadline visibility.">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
              <thead>
                <tr className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleTasks.map((task) => {
                  const taskId = taskIdOf(task);
                  return (
                    <tr key={taskId || task.title} className={isBreached(task) ? "bg-rose-500/5" : ""}>
                      <td className="px-4 py-4 font-medium text-white">{task.title ?? task.name ?? "Task"}</td>
                      <td className="px-4 py-4">{task.service_name ?? task.serviceName ?? "?"}</td>
                      <td className="px-4 py-4">{task.assignee_name ?? task.assigneeName ?? "Unassigned"}</td>
                      <td className="px-4 py-4">{formatDateTime(task.dueAt ?? task.due_at ?? task.deadline)}</td>
                      <td className="px-4 py-4"><StatusBadge status={task.sla_status ?? task.status ?? "todo"} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
