/**
 * Where the backend lives — which differs depending on who is asking.
 *
 * Every component previously hardcoded
 * `https://dull-meggie-1omar-d9f030db.koyeb.app` as its fallback. That
 * deployment no longer resolves, so a fresh clone failed on every AI feature.
 *
 * The two constants below are not redundant. Next.js route handlers run
 * *inside the container*, where `localhost` is the frontend itself, not the
 * API — server-side calls to the browser's URL fail with ECONNREFUSED. They
 * need the compose service name. The browser needs the published host port.
 */

/** For code running in the browser. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8600";

/** For code running on the Next.js server (route handlers, RSC fetches). */
export const API_BASE_URL_SERVER =
  process.env.API_BASE_URL_SERVER ?? API_BASE_URL;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serverApiUrl(path: string): string {
  return `${API_BASE_URL_SERVER}${path.startsWith("/") ? path : `/${path}`}`;
}
