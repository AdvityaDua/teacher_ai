import type { AuthUser } from "@/types";

let currentToken: string | null = null;

export function saveAuth(token: string, user: AuthUser) {
  currentToken = token;
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
  return currentToken;
}

export function clearAuth() {
  currentToken = null;
  localStorage.removeItem("teacher_user");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
