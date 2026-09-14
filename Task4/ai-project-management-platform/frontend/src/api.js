const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function getToken() {
  return localStorage.getItem("devflow_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("devflow_token", token);
  else localStorage.removeItem("devflow_token");
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}
