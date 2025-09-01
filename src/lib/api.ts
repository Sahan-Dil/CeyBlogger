export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/+$/,
  ""
);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return sessionStorage.getItem("token");
}

export function setToken(token: string) {
  if (!isBrowser()) return;
  sessionStorage.setItem("token", token);
}

export function clearToken() {
  if (!isBrowser()) return;
  sessionStorage.removeItem("token");
}

function buildUrl(path: string): string {
  if (!path) return API_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const p = path.replace(/^\/+/, "");
  return API_URL ? `${API_URL}/${p}` : `/${p}`;
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  const text = await res.text();
  if (!res.ok) {
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }
    const message =
      parsed && typeof parsed === "object"
        ? parsed.message ?? JSON.stringify(parsed)
        : parsed ?? res.statusText;
    throw new ApiError(res.status, message, parsed);
  }

  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    // If response isn't JSON, return raw text
    return text as unknown as T;
  }
}

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);
  const token = getToken();

  const headers = new Headers(init.headers ?? {});

  // only set Content-Type automatically when body is not FormData
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  return parseResponse<T>(res);
}

/* Convenience wrappers */
export const get = <T = any>(path: string, init?: RequestInit) => {
  const token = getToken();
  console.log("Token in GET:", token);
  const headers: HeadersInit = {
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return apiFetch<T>(path, {
    method: "GET",
    ...init,
    headers,
  });
};

export const post = <T = any>(path: string, body?: any, init?: RequestInit) => {
  const isForm = body instanceof FormData;
  return apiFetch<T>(path, {
    method: "POST",
    body: isForm ? body : JSON.stringify(body),
    ...init,
  });
};

export const put = <T = any>(path: string, body?: any, init?: RequestInit) => {
  const isForm = body instanceof FormData;
  return apiFetch<T>(path, {
    method: "PUT",
    body: isForm ? body : JSON.stringify(body),
    ...init,
  });
};

export const patch = <T = any>(
  path: string,
  body?: any,
  init?: RequestInit
) => {
  const isForm = body instanceof FormData;
  return apiFetch<T>(path, {
    method: "PATCH",
    body: isForm ? body : JSON.stringify(body),
    ...init,
  });
};

export const del = <T = any>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: "DELETE", ...init });

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
