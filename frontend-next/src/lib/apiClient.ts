import { apiFetch, apiJson, createQueryString, unwrapData, ApiError } from "./api";
import type { ApiFetchOptions } from "./api";

export const ADMIN_API_PREFIX = "/api/v1";
const ADMIN_ROUTE_PREFIX = "/admin";

export function normalizeAdminPath(path: string) {
  if (!path) {
    throw new Error("Admin API path is required.");
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith(ADMIN_API_PREFIX)) {
    return path;
  }

  let cleaned = path.startsWith("/") ? path : `/${path}`;

  if (cleaned === "/api") {
    cleaned = "";
  } else if (cleaned.startsWith("/api/")) {
    cleaned = cleaned.slice(4);
  }

  if (!cleaned.startsWith(ADMIN_ROUTE_PREFIX)) {
    cleaned = `${ADMIN_ROUTE_PREFIX}${cleaned}`;
  }

  return `${ADMIN_API_PREFIX}${cleaned}`;
}

export function adminQuery(path: string, params: Record<string, string | number | boolean | null | undefined> = {}) {
  const query = createQueryString(params);
  return query ? `${normalizeAdminPath(path)}?${query}` : normalizeAdminPath(path);
}

export async function adminGet<T>(path: string, options: ApiFetchOptions = {}, label = "admin.get") {
  return apiJson<T>(normalizeAdminPath(path), {
    ...options,
    credentials: options.credentials ?? "include",
  }, { label });
}

export async function adminPost<T>(path: string, options: ApiFetchOptions = {}, label = "admin.post") {
  return apiJson<T>(normalizeAdminPath(path), {
    ...options,
    method: options.method || "POST",
    credentials: options.credentials ?? "include",
  }, { label });
}

export async function adminPatch<T>(path: string, options: ApiFetchOptions = {}, label = "admin.patch") {
  return apiJson<T>(normalizeAdminPath(path), {
    ...options,
    method: options.method || "PATCH",
    credentials: options.credentials ?? "include",
  }, { label });
}

export { apiFetch, apiJson, createQueryString, unwrapData, ApiError };