const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

export function clearAccessToken() {
  localStorage.removeItem("access_token");
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}