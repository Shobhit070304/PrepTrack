export type ApiError = Error & {
  status: number;
  fieldErrors: Record<string, string>;
};

type ApiOptions = RequestInit & { skipUnauthorizedHandling?: boolean };
type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipUnauthorizedHandling = false, headers, ...init } = options;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      credentials: "include",
      headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...headers },
    });
  } catch {
    throw makeApiError("Could not connect to the PrepTrack API.", 0, {});
  }

  if (response.status === 401 && !skipUnauthorizedHandling && !path.startsWith("/api/auth/")) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    let body: { message?: string; fieldErrors?: Record<string, string> } = {};
    try { body = await response.json() as typeof body; } catch { /* use the status fallback */ }
    throw makeApiError(body.message || `Request failed (${response.status}).`, response.status, body.fieldErrors || {});
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function makeApiError(message: string, status: number, fieldErrors: Record<string, string>): ApiError {
  return Object.assign(new Error(message), { status, fieldErrors });
}
