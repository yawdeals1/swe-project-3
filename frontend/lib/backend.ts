const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fieldErrors: string[];

  constructor(status: number, message: string, fieldErrors: string[] = []) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface BackendFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

// The single point every Server Component / Server Action goes through to reach the Spring
// Boot API. Runs server-side only (BACKEND_INTERNAL_URL is never exposed to the browser).
export async function backendFetch<T>(path: string, options: BackendFetchOptions = {}): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
        res.status,
        (data && data.message) || "Request failed",
        (data && data.fieldErrors) || []);
  }

  return data as T;
}
