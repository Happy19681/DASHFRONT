const configuredApiBase = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const API_ORIGIN = configuredApiBase
  ? configuredApiBase.replace(/\/api$/i, "")
  : import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://dashboard-api-3mqv.onrender.com";
const API_BASE_URL = `${API_ORIGIN}/api`;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail ?? `API request failed (${response.status})`);
  }
  return payload;
}
