const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("teacher_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken?: string; access_token?: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getUniversityAnalytics: (universityId: string) =>
    request<any>(`/universities/${universityId}/analytics`),

  getUniversityStudents: (universityId: string) =>
    request<any>(`/universities/${universityId}/students`),

  getUniversityTeachers: (universityId: string) =>
    request<any>(`/universities/${universityId}/teachers`),

  getAnalyticsSummary: () =>
    request<any>("/analytics/summary"),

  getAdminDashboard: () =>
    request<any>("/analytics/admin/dashboard"),

  getRecentSessions: (limit = 20) =>
    request<any>(`/analytics/admin/recent-sessions?limit=${limit}`),

  getVisitors: () =>
    request<any>("/analytics/visitors"),

  getPopularPages: (limit = 10) =>
    request<any>(`/analytics/admin/popular-pages?limit=${limit}`),

  getAIUsageStats: () =>
    request<any>("/analytics/admin/ai-usage"),

  triggerUniversityReport: (universityId: string) =>
    request<{ success: boolean; message: string; sent: number; failed: number }>(
      `/email/university-report/trigger/${universityId}`,
      { method: "POST" }
    ),
};
