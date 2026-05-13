"use client";

import { useDeferredValue, useState } from "react";
import { buttonClassName, Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CollectionItem = Record<string, unknown>;

type ClientDocumentsPanelProps = {
  className?: string;
  documents: CollectionItem[];
  totalDocuments?: number;
};

type NormalizedDocument = {
  id: string;
  title: string;
  documentType: string;
  folderName: string;
  uploadedAt: string;
  fileUrl: string;
  mimeType: string;
  size: number;
};

function getString(item: CollectionItem, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getNumber(item: CollectionItem, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatSize(size: number) {
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

function formatLabel(value: string) {
  if (!value) {
    return "General";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeDocuments(documents: CollectionItem[]) {
  return documents.map((item, index) => {
    const title =
      getString(item, "original_name", "originalName", "file_name", "fileName") ||
      `${formatLabel(getString(item, "document_type", "documentType") || "document")} ${index + 1}`;

    return {
      id: getString(item, "id") || `${title}-${index}`,
      title,
      documentType: getString(item, "document_type", "documentType") || "general",
      folderName: getString(item, "folder_name", "folderName") || "general",
      uploadedAt: getString(item, "uploaded_at", "uploadedAt"),
      fileUrl: getString(item, "file_url", "fileUrl"),
      mimeType: getString(item, "mime_type", "mimeType") || "Document",
      size: getNumber(item, "size"),
    } satisfies NormalizedDocument;
  });
}

export function ClientDocumentsPanel({ className = "", documents, totalDocuments }: ClientDocumentsPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const normalizedDocuments = normalizeDocuments(documents);
  const uniqueTypes = Array.from(new Set(normalizedDocuments.map((document) => document.documentType))).sort((left, right) =>
    left.localeCompare(right),
  );
  const filteredDocuments = normalizedDocuments.filter((document) => {
    const matchesType = selectedType === "all" || document.documentType === selectedType;
    const haystack = `${document.title} ${document.documentType} ${document.folderName} ${document.mimeType}`.toLowerCase();
    const matchesQuery = !deferredQuery.trim() || haystack.includes(deferredQuery.trim().toLowerCase());
    return matchesType && matchesQuery;
  });

  const latestUpload = normalizedDocuments[0];
  const categoriesCount = uniqueTypes.length;
  const totalStorage = normalizedDocuments.reduce((sum, document) => sum + document.size, 0);
  const safeTotalDocuments = totalDocuments ?? normalizedDocuments.length;

  return (
    <Card className={["p-6", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Document hub</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Search, filter, and open your latest compliance files without leaving the client portal.
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Secure storage snapshot</p>
          <p className="mt-1 text-emerald-800/80">{safeTotalDocuments} files synced from your account</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total documents</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{safeTotalDocuments}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{categoriesCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Last upload</p>
          <p className="mt-3 text-sm font-semibold text-slate-950">{formatDate(latestUpload?.uploadedAt)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Storage used</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{formatSize(totalStorage)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="w-full max-w-xl space-y-2 text-sm font-medium text-slate-700">
          <span>Search documents</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file name, type, folder, or format"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedType === "all" ? "primary" : "secondary"} size="md" onClick={() => setSelectedType("all")} type="button">
            All files
          </Button>
          {uniqueTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "primary" : "secondary"}
              size="md"
              onClick={() => setSelectedType(type)}
              type="button"
            >
              {formatLabel(type)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filteredDocuments.length ? (
          filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-950">{document.title}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {formatLabel(document.documentType)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{formatLabel(document.folderName)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Uploaded {formatDate(document.uploadedAt)} | {document.mimeType} | {formatSize(document.size)}
                </p>
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
                {document.fileUrl ? (
                  <a
                    href={document.fileUrl}
                    download
                    className={buttonClassName({ variant: "ghost", size: "md" })}
                  >
                    Download
                  </a>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    File link unavailable
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
            <p className="text-base font-semibold text-slate-950">No documents match this view.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Try another filter, clear your search, or upload a fresh file below.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
