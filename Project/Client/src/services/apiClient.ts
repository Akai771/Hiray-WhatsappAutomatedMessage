import { clearSession, getAccessToken, getRefreshToken, setSession } from "./tokenStorage";
import type { ApiEnvelope, AuthSession, PaginatedEnvelope } from "./types";

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000/api/v1";

// Dispatched when a request fails auth and the refresh attempt also fails —
// listen for this at the app shell level to redirect to login.
export const AUTH_EXPIRED_EVENT = "wa:auth-expired";

export class ApiClientError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  isFormData?: boolean;
  /** internal: prevents infinite retry loops after a refresh attempt */
  _isRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const body: ApiEnvelope<AuthSession> = await res.json();
    if (!body.success) return false;

    setSession(body.data);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, isFormData, _isRetry } = options;

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (response.status === 401 && !_isRetry && path !== "/auth/refresh" && path !== "/auth/login") {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;

    if (refreshed) {
      return request<T>(path, { ...options, _isRetry: true });
    }

    clearSession();
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(response.status, payload?.message ?? "Request failed", payload?.data);
  }

  return payload as T;
}

export function apiGet<T>(path: string, query?: RequestOptions["query"]): Promise<ApiEnvelope<T>> {
  return request<ApiEnvelope<T>>(path, { method: "GET", query });
}

export function apiGetPaginated<T>(path: string, query?: RequestOptions["query"]): Promise<PaginatedEnvelope<T>> {
  return request<PaginatedEnvelope<T>>(path, { method: "GET", query });
}

export function apiPost<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  return request<ApiEnvelope<T>>(path, { method: "POST", body });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  return request<ApiEnvelope<T>>(path, { method: "PATCH", body });
}

export function apiDelete<T>(path: string): Promise<ApiEnvelope<T>> {
  return request<ApiEnvelope<T>>(path, { method: "DELETE" });
}

export function apiUpload<T>(path: string, formData: FormData): Promise<ApiEnvelope<T>> {
  return request<ApiEnvelope<T>>(path, { method: "POST", body: formData, isFormData: true });
}
