// Per-app settings for the shared platform tests in tests/platform. Every app edits this file;
// the platform specs themselves stay identical across SDK apps.

export type RouteSpec = {
  method: "get" | "post" | "put" | "delete";
  /** Path under /api, without the query string. */
  path: string;
  data?: Record<string, unknown>;
};

// 1x1 transparent PNG, small enough for every upload test.
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * API routes that read the session credentials (getCredentials). Each one must reject missing or
 * foreign credentials and must never send the interactive secret to the browser. List them all.
 */
export const CREDENTIALED_ROUTES: RouteSpec[] = [
  { method: "get", path: "/quest" },
  { method: "get", path: "/leaderboard" },
  { method: "get", path: "/quest-items" },
  { method: "post", path: "/drop-quest-item" },
  { method: "post", path: "/quest-item-clicked" },
  { method: "post", path: "/dropped-asset/remove-all-with-unique-name" },
  { method: "delete", path: "/dropped-asset/quest-item-1" },
  { method: "post", path: "/admin-settings", data: { numberAllowedToCollect: 3, questItemImage: "https://example.invalid/q.png" } },
  { method: "put", path: "/visitor/move", data: { moveTo: { x: 10, y: 20 } } },
  { method: "delete", path: "/quest" },
  { method: "post", path: "/uploads", data: { filename: "gem.png", contentType: "image/png", data: PNG } },
  { method: "get", path: "/uploads" },
  { method: "delete", path: "/uploads", data: { key: "userUploads/e2e-public-key/nobody_gem.png" } },
];

/** Page the app opens in its iframe; the platform tests load it with valid credentials. */
export const ENTRY_PAGE = "/";
