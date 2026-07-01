import { apiRequest, setAccessToken, clearAccessToken } from "./client";

export async function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setAccessToken(result.access_token);
  localStorage.setItem("current_user", JSON.stringify(result.user));

  return result;
}

export async function getMe() {
  return apiRequest("/auth/me");
}

export function logoutUser() {
  clearAccessToken();
  localStorage.removeItem("current_user");
}