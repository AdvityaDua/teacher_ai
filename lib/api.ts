import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  // ── Class APIs ──────────────────────────────────────────────────────────
  getClasses: () => request<any[]>("/classes"),

  getClass: (id: string) => request<any>(`/classes/${id}`),

  createClass: (data: { name: string; department?: string; semester?: string }) =>
    request<any>("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateClass: (id: string, data: Record<string, any>) =>
    request<any>(`/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteClass: (id: string) =>
    request<{ success: boolean }>(`/classes/${id}`, { method: "DELETE" }),

  enrollStudents: (id: string, studentIds: string[]) =>
    request<any>(`/classes/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify({ studentIds }),
    }),

  removeStudentFromClass: (classId: string, studentId: string) =>
    request<{ success: boolean }>(`/classes/${classId}/students/${studentId}`, {
      method: "DELETE",
    }),

  // Assignments
  getAssignments: () => request<any[]>("/assignments"),
  getAssignment: (id: string) => request<any>(`/assignments/${id}`),
  createAssignment: (data: any) => request<any>("/assignments", { method: "POST", body: JSON.stringify(data) }),
  updateAssignment: (id: string, data: any) => request<any>(`/assignments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAssignment: (id: string) => request<{ success: boolean }>(`/assignments/${id}`, { method: "DELETE" }),

  // Alerts
  getAlerts: () => request<any[]>("/alerts"),
  getUnreadAlertsCount: () => request<{ count: number }>("/alerts/unread-count"),
  markAlertRead: (id: string) => request<any>(`/alerts/${id}/read`, { method: "PATCH", body: JSON.stringify({ isRead: true }) }),
  markAllAlertsRead: () => request<any>("/alerts/read-all", { method: "PATCH" }),
  triggerAlertChecks: () => request<{ success: boolean }>("/alerts/trigger-checks", { method: "POST" }),

  // Insights
  getTeacherInsights: () => request<any>("/analytics/teacher-insights"),

  // Feedback
  getTeacherFeedback: () => request<any[]>("/feedback/teacher"),
  getStudentFeedback: () => request<any[]>("/feedback/student"), // for admin/testing
  createFeedback: (data: any) => request<any>("/feedback", { method: "POST", body: JSON.stringify(data) }),
  updateFeedback: (id: string, data: any) => request<any>(`/feedback/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteFeedback: (id: string) => request<{ success: boolean }>(`/feedback/${id}`, { method: "DELETE" }),
  markFeedbackRead: (id: string) => request<any>(`/feedback/${id}/read`, { method: "PATCH" }),
};

