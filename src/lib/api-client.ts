/**
 * The single way the browser talks to /api.
 *
 * Every collection endpoint returns `{ data, total, page, totalPages }`. The
 * previous client assumed a bare array and typed it as one, so when the
 * envelope was introduced the mismatch was invisible to TypeScript and showed
 * up only as an empty dashboard. `getList` therefore *checks* the shape at
 * runtime and throws a named error instead of letting `.filter is not a
 * function` surface as "Please try again later".
 */

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Thrown when a response parses but is not the shape the caller expected. */
export class ApiShapeError extends Error {
  constructor(path: string, expected: string, received: unknown) {
    super(
      `${path} returned an unexpected shape: expected ${expected}, received ${
        Array.isArray(received) ? "array" : typeof received
      }`
    );
    this.name = "ApiShapeError";
  }
}

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    // Session lives in an httpOnly cookie; nothing is read from localStorage.
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

/** Fetches a single object. */
export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

/**
 * Fetches a collection and unwraps the pagination envelope. Accepts a bare
 * array too, so an endpoint that has not been migrated yet still works.
 */
export async function getList<T>(path: string): Promise<T[]> {
  const body = await request<Paginated<T> | T[]>(path);

  if (Array.isArray(body)) return body;

  if (body && typeof body === "object" && Array.isArray((body as Paginated<T>).data)) {
    return (body as Paginated<T>).data;
  }

  throw new ApiShapeError(path, "an array or { data: [...] }", body);
}

/** Fetches a collection and keeps the pagination metadata. */
export async function getPage<T>(path: string): Promise<Paginated<T>> {
  const body = await request<Paginated<T> | T[]>(path);

  if (Array.isArray(body)) {
    return { data: body, total: body.length, page: 1, totalPages: 1 };
  }

  if (body && typeof body === "object" && Array.isArray((body as Paginated<T>).data)) {
    return body as Paginated<T>;
  }

  throw new ApiShapeError(path, "{ data: [...] }", body);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

/** Turns any thrown value into something safe to show a patient. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof ApiShapeError) return fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
