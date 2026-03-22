export interface University {
  _id: string;
  name: string;
  domain: string;
  isActive: boolean;
  resumeLimit: number;
  interviewLimit: number;
  allowedFeatures: string[];
  logoUrl?: string;
  adminEmail?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  universityId?: string;
  rollNumber?: string;
  createdAt?: string;
  resumeCount: number;
  interviewCount: number;
  subscriptionStatus?: string;
  profileImageUrl?: string;
  resumeUsage: { used: number; limit: number };
  interviewUsage: { used: number; limit: number };
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  profileImageUrl?: string;
}

export interface UniversityAnalytics {
  university: University;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalInterviews: number;
    totalResumes: number;
    interviewLimit: number;
    resumeLimit: number;
  };
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  activeSessions: number;
  popularPages: Array<{ _id: string; count: number }>;
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    totalInterviews: number;
    totalResumes: number;
    totalRevenue: number;
    activeSessions: number;
    paidUsers: number;
    growth: { newUsersLast7Days: number; conversionRate: string };
  };
  activityChart: Array<{ date: string; sessions: number; userCount: number }>;
  userMetrics: { roles: Record<string, number> };
  contentMetrics: { popularTopics: Array<{ topic: string; count: number }>; totalResumes: number };
  trafficMetrics: { sources: Array<{ source: string; count: number }>; devices: Record<string, number> };
  updatedAt: string;
}

export interface Session {
  _id: string;
  sessionId: string;
  visitorId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  pageCount: number;
  landingPage?: string;
  exitPage?: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  device?: string;
  isActive: boolean;
}

export interface Visitor {
  _id: string;
  visitorId: string;
  userId?: string;
  country?: string;
  device?: string;
  firstVisit: string;
  lastVisit: string;
  totalSessions: number;
  totalPageViews: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  universityId?: string;
  profileImageUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
