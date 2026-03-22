import type { AuthUser } from "@/types";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem("teacher_token", token);
  localStorage.setItem("teacher_user", JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("teacher_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("teacher_token");
}

export function clearAuth() {
  localStorage.removeItem("teacher_token");
  localStorage.removeItem("teacher_user");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
