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

export interface Class {
  _id: string;
  name: string;
  department?: string;
  semester?: string;
  classCode: string;
  inviteLink: string;
  teacherId: string;
  universityId: string;
  students: string[];
  isActive: boolean;
  studentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  avgInterviewScore: number;
}

export interface ClassDetail extends Class {
  stats: ClassStats;
  studentList: Student[];
}

export interface Assignment {
  _id: string;
  title: string;
  classId: string;
  className?: string; // from enrichment
  teacherId: string;
  universityId: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  numInterviews: number;
  deadline: string;
  assignedTo: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // stats from enrichment
  studentCount?: number;
  completedCount?: number;
  completionPercent?: number;
  avgScore?: number;
}

export interface StudentAssignment {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  profileImageUrl?: string;
  status: "assigned" | "in_progress" | "completed" | "evaluated";
  completedInterviews: number;
  scores: number[];
  avgScore: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentDetail extends Assignment {
  stats: {
    totalStudents: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionPercent: number;
    avgScore: number;
  };
  studentProgress: StudentAssignment[];
}

export interface Alert {
  _id: string;
  type: "engagement" | "performance" | "risk" | "usage";
  message: string;
  teacherId: string;
  universityId?: string;
  classId?: string;
  className?: string; // from enrichment
  studentId?: string;
  student?: {
    name: string;
    email: string;
    profileImageUrl?: string;
  }; // from enrichment
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface StudentInsight {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  interviewsCompleted: number;
  averageScore: number;
  scoreHistory?: number[]; // simplified trend
}

export interface TeacherInsights {
  topWeaknesses: {
    topic: string;
    averageScore: number;
  }[];
  atRiskStudents: StudentInsight[];
  placementReadyStudents: StudentInsight[];
}

export interface Feedback {
  _id: string;
  teacherId: string | Teacher;
  studentId: string | Student;
  type: "interview" | "resume" | "general";
  resultId?: string;
  assignmentId?: string;
  content: string;
  rating?: number;
  suggestions: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

