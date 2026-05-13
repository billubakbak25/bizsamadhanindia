const API_VERSION_PREFIX = "/api/v1";

function normalizeConfiguredApiBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  let normalized = trimmed;

  if (/^\/\//.test(normalized)) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized) && /^[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  return normalized.replace(/\/(?:api(?:\/v\d+)?)?\/?$/i, "").replace(/\/+$/, "");
}

const rawApiBaseUrl = normalizeConfiguredApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
);

export const API_BASE_URL = rawApiBaseUrl;
export { API_VERSION_PREFIX };

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  json?: unknown;
};

export type ApiRequestMeta = {
  label?: string;
};

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

function normalizeApiPath(path: string) {
  if (path === "/api" || path.startsWith("/api/")) {
    if (path === API_VERSION_PREFIX || path.startsWith(`${API_VERSION_PREFIX}/`)) {
      return path;
    }

    return `${API_VERSION_PREFIX}${path.slice(4)}`;
  }

  if (path === "/client" || path.startsWith("/client/")) {
    return `${API_VERSION_PREFIX}${path}`;
  }

  return path;
}

function browserLog(method: "log" | "error", message: string, data: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const writer = method === "error" ? console.error : console.log;
  writer(`[BizSamadhan API] ${message}`, data);
}

export function buildApiUrl(path: string) {
  if (!path) {
    throw new Error("API path is required.");
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const normalizedPath = normalizeApiPath(path);

  try {
    return new URL(normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`, `${API_BASE_URL}/`).toString();
  } catch (error) {
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid NEXT_PUBLIC_API_URL: ${configuredBaseUrl || "<empty>"}. ${errorMessage}`);
  }
}

function parsePayload(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    const candidate = payload as { message?: string; error?: { message?: string } };

    if (candidate.error?.message) {
      return candidate.error.message;
    }

    if (candidate.message) {
      return candidate.message;
    }
  }

  return `Request failed with status ${status}.`;
}

export function createQueryString(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    search.set(key, String(value));
  });

  return search.toString();
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}, meta: ApiRequestMeta = {}) {
  const url = buildApiUrl(path);
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  let body = options.body ?? null;

  if (options.json !== undefined) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
    body = JSON.stringify(options.json);
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
    body,
    credentials: options.credentials ?? "omit",
  };

  browserLog("log", "request", {
    label: meta.label || path,
    method,
    url,
    baseUrl: API_BASE_URL,
    credentials: requestInit.credentials || "omit",
    hasBody: body !== null && body !== undefined,
  });

  try {
    const response = await fetch(url, requestInit);

    browserLog(response.ok ? "log" : "error", "response", {
      label: meta.label || path,
      method,
      url,
      status: response.status,
      ok: response.ok,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    browserLog("error", "request failed", {
      label: meta.label || path,
      method,
      url,
      baseUrl: API_BASE_URL,
      error: errorMessage,
    });

    throw new Error(`Network request failed for ${url}. ${errorMessage}. Check NEXT_PUBLIC_API_URL, Railway backend availability, and CORS.`);
  }
}

export async function apiJson<T>(path: string, options: ApiFetchOptions = {}, meta: ApiRequestMeta = {}) {
  const response = await apiFetch(path, options, meta);
  const text = await response.text();
  const payload = parsePayload(text);

  if (!response.ok) {
    throw new ApiError(resolveErrorMessage(response.status, payload), response.status, payload);
  }

  return payload as T;
}

export function unwrapData<T>(payload: { data?: T } | T) {
  if (payload && typeof payload === "object" && "data" in (payload as { data?: T })) {
    return (payload as { data?: T }).data as T;
  }

  return payload as T;
}
