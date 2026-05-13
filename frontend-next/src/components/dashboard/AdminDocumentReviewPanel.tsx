"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError, apiJson, createQueryString, unwrapData } from "@/lib/api";

type Envelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type AdminVaultDocument = {
  id: number | string;
  clientId?: number | string;
  client?: {
    id?: number | string;
    name?: string;
    phone?: string;
    email?: string;
  };
  folderName?: string;
  documentType?: string;
  fileName?: string;
  originalName?: string;
  fileUrl?: string;
  mimeType?: string;
  size?: number;
  uploadedByRole?: string;
  uploadedAt?: string;
  reviewStatus?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewedByRole?: string;
};

type AdminVaultFolder = {
  folderName?: string;
  totalDocuments?: number;
  totalClients?: number;
  latestUploadedAt?: string;
};

type VaultDocumentsPayload = {
  items?: AdminVaultDocument[];
  folders?: AdminVaultFolder[];
  summary?: {
    totalDocuments?: number;
    totalClients?: number;
    totalFolders?: number;
    latestUploadedAt?: string;
  };
  pagination?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
};

const EMPTY_PAYLOAD: VaultDocumentsPayload = {
  items: [],
  folders: [],
  summary: {
    totalDocuments: 0,
    totalClients: 0,
    totalFolders: 0,
    latestUploadedAt: "",
  },
  pagination: {
    total: 0,
    limit: 8,
    offset: 0,
  },
};

const REVIEW_ACTIONS = [
  { value: "pending_review", label: "Mark pending" },
  { value: "in_review", label: "Start review" },
  { value: "approved", label: "Approve" },
  { value: "needs_changes", label: "Needs changes" },
] as const;

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatSize(size?: number) {
  if (!size || size <= 0) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let current = size / 1024;
  let unitIndex = 0;

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }

  return `${current.toFixed(current >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatLabel(value?: string) {
  if (!value) {
    return "General";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getReviewState(document: AdminVaultDocument) {
  const reviewStatus = (document.reviewStatus || "pending_review").toLowerCase();

  if (reviewStatus === "approved") {
    return {
      label: "Approved",
      detail: document.reviewedAt ? `Reviewed ${formatDate(document.reviewedAt)}.` : "Approved and ready.",
      badgeClassName: "bg-emerald-50 text-emerald-700",
    };
  }

  if (reviewStatus === "in_review") {
    return {
      label: "In review",
      detail: "An admin is actively checking this document.",
      badgeClassName: "bg-sky-50 text-sky-700",
    };
  }

  if (reviewStatus === "needs_changes") {
    return {
      label: "Needs changes",
      detail: "Follow up with the client for a corrected upload.",
      badgeClassName: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Pending review",
    detail: "Waiting for the first admin review.",
    badgeClassName: "bg-slate-100 text-slate-700",
  };
}

export function AdminDocumentReviewPanel({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [payload, setPayload] = useState<VaultDocumentsPayload>(EMPTY_PAYLOAD);
  const [status, setStatus] = useState("Loading document review queue...");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string>("");
  const deferredQuery = useDeferredValue(query);

  async function loadDocuments() {
    setIsLoading(true);
    setStatus("Loading document review queue...");

    try {
      const queryString = createQueryString({
        limit: 8,
        offset: 0,
        search: deferredQuery.trim() || undefined,
        folderName: selectedFolder === "all" ? undefined : selectedFolder,
      });
      const nextPayload = await apiJson<Envelope<VaultDocumentsPayload>>(
        `/api/admin/vault/documents${queryString ? `?${queryString}` : ""}`,
        { credentials: "include", cache: "no-store" },
        { label: "admin.vaultDocuments" },
      );

      const data = unwrapData(nextPayload) || EMPTY_PAYLOAD;
      setPayload({
        items: data.items || [],
        folders: data.folders || [],
        summary: data.summary || EMPTY_PAYLOAD.summary,
        pagination: data.pagination || EMPTY_PAYLOAD.pagination,
      });
      setStatus(`Showing ${(data.items || []).length} of ${data.pagination?.total || 0} documents in the review queue.`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus("Admin session expired. Please sign in again.");
      } else {
        setStatus(error instanceof Error ? error.message : "Unable to load document review queue.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [deferredQuery, selectedFolder]);

  async function updateReviewStatus(documentId: number | string, reviewStatus: string) {
    setUpdatingDocumentId(String(documentId));

    try {
      await apiJson<Envelope<AdminVaultDocument>>(
        `/api/admin/vault/documents/${documentId}/review`,
        {
          method: "POST",
          credentials: "include",
          json: { reviewStatus },
        },
        { label: "admin.updateDocumentReview" },
      );
      await loadDocuments();
      setStatus(`Document ${documentId} marked as ${formatLabel(reviewStatus)}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update document review status.");
    } finally {
      setUpdatingDocumentId("");
    }
  }

  const documents = payload.items || [];
  const folders = payload.folders || [];
  const summary = payload.summary || EMPTY_PAYLOAD.summary!;
  const topFolders = folders.slice(0, 5);

  return (
    <Card className={["p-6", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Document review queue</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review recent client uploads, scan top folders, and update persistent review statuses directly from the admin console.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">Queue status</p>
          <p className="mt-1 text-slate-500">{status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total documents</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{summary.totalDocuments || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active clients</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{summary.totalClients || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Folders</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{summary.totalFolders || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Latest upload</p>
          <p className="mt-3 text-sm font-semibold text-slate-950">{formatDate(summary.latestUploadedAt)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="w-full max-w-xl space-y-2 text-sm font-medium text-slate-700">
          <span>Search documents</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file, folder, client, or document type"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={selectedFolder === "all" ? "primary" : "secondary"} onClick={() => setSelectedFolder("all")}>
            All folders
          </Button>
          {topFolders.map((folder) => {
            const value = folder.folderName || "general";
            return (
              <Button
                key={value}
                type="button"
                variant={selectedFolder === value ? "primary" : "secondary"}
                onClick={() => setSelectedFolder(value)}
              >
                {formatLabel(value)}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-3">
          {documents.length ? (
            documents.map((document) => {
              const reviewState = getReviewState(document);
              const currentStatus = (document.reviewStatus || "pending_review").toLowerCase();
              const isUpdating = updatingDocumentId === String(document.id);

              return (
                <div key={document.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{document.originalName || document.fileName || "Document"}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewState.badgeClassName}`}>{reviewState.label}</span>
                      </div>
                      <p className="mt-2 text-slate-700">{document.client?.name || "Unknown client"} | {document.client?.phone || "No phone"}</p>
                      <p className="mt-1 text-slate-500">
                        {formatLabel(document.documentType)} | {formatLabel(document.folderName)} | {formatSize(document.size)}
                      </p>
                      <p className="mt-1 text-slate-500">Uploaded {formatDate(document.uploadedAt)} by {formatLabel(document.uploadedByRole || "client")}</p>
                      <p className="mt-2 text-sm text-slate-600">{reviewState.detail}</p>
                      {document.reviewedAt ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                          Last review {formatDate(document.reviewedAt)} by {formatLabel(document.reviewedByRole || document.reviewedByUserId || "admin")}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {document.fileUrl ? (
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonClassName({ variant: "secondary", size: "md" })}
                        >
                          Open file
                        </a>
                      ) : null}
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Client #{document.clientId || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {REVIEW_ACTIONS.map((action) => (
                      <Button
                        key={action.value}
                        type="button"
                        size="md"
                        variant={currentStatus === action.value ? "primary" : "secondary"}
                        onClick={() => updateReviewStatus(document.id, action.value)}
                        disabled={isUpdating || currentStatus === action.value}
                      >
                        {isUpdating && currentStatus !== action.value ? "Updating..." : action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
              <p className="text-base font-semibold text-slate-950">No documents match this filter.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Try another folder or clear the search to see more uploaded files.</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Top folders</p>
            <div className="mt-4 space-y-3">
              {topFolders.length ? (
                topFolders.map((folder) => (
                  <button
                    key={folder.folderName || "general"}
                    type="button"
                    onClick={() => setSelectedFolder(folder.folderName || "general")}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-[var(--brand)] hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-950">{formatLabel(folder.folderName)}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{folder.totalDocuments || 0} docs</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{folder.totalClients || 0} clients | Latest {formatDate(folder.latestUploadedAt)}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">Folder analytics will appear here once documents are available.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Review flow</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use Pending Review, In Review, Approved, and Needs Changes to keep document follow-up visible for your team.
            </p>
            {isLoading ? <p className="mt-3 text-sm text-slate-500">Refreshing queue...</p> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
