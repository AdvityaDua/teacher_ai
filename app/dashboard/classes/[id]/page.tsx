"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Mic,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  UserPlus,
  Search,
  X,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import FeedbackModal from "@/components/FeedbackModal";
import { api } from "@/lib/api";
import type { ClassDetail, Student } from "@/types";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [data, setData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [feedbackStudent, setFeedbackStudent] = useState<Student | null>(null);


  // Enroll modal state
  const [showEnroll, setShowEnroll] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [enrollSearch, setEnrollSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await api.getClass(classId);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [classId]);

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Remove this student from the class?")) return;
    setRemoving(studentId);
    try {
      await api.removeStudentFromClass(classId, studentId);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRemoving(null);
    }
  };

  // Load all university students for enrollment
  const openEnrollModal = async () => {
    setShowEnroll(true);
    setLoadingStudents(true);
    try {
      // Try to load university students (using stored user data)
      const raw = localStorage.getItem("teacher_user");
      const user = raw ? JSON.parse(raw) : null;
      if (user?.universityId) {
        const res = await api.getUniversityStudents(user.universityId);
        const enrolled = new Set(data?.students || []);
        // Filter out already enrolled students
        setAllStudents(
          (res.students || []).filter(
            (s: Student) => !enrolled.has(s._id)
          )
        );
      }
    } catch {
      setAllStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleEnroll = async () => {
    if (selectedIds.length === 0) return;
    setEnrolling(true);
    try {
      await api.enrollStudents(classId, selectedIds);
      setShowEnroll(false);
      setSelectedIds([]);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(enrollSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(enrollSearch.toLowerCase())
  );

  return (
    <DashboardLayout
      title={data?.name || "Class Detail"}
      subtitle={
        [data?.department, data?.semester].filter(Boolean).join(" · ") ||
        undefined
      }
    >
      <button
        onClick={() => router.push("/dashboard/classes")}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Classes
      </button>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-6 text-sm flex items-center gap-3">
          <span className="font-semibold">Error:</span> {error}
          <button
            onClick={load}
            className="ml-auto flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={data.stats.totalStudents}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Active (7d)"
              value={data.stats.activeStudents}
              icon={UserCheck}
              color="emerald"
            />
            <StatCard
              label="Inactive"
              value={data.stats.inactiveStudents}
              icon={UserX}
              color="rose"
            />
            <StatCard
              label="Avg. Interviews"
              value={data.stats.avgInterviewScore}
              icon={Mic}
              color="violet"
            />
          </div>

          {/* Class code & invite link */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Invite Students
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Code */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-2">
                  Class Code
                </p>
                <div className="flex items-center gap-3">
                  <code className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em]">
                    {data.classCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(data.classCode, "code")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Copy code"
                  >
                    {copied === "code" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
              {/* Link */}
              {data.inviteLink && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-2">
                    Invite Link
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                      {data.inviteLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(data.inviteLink, "link")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0"
                      title="Copy link"
                    >
                      {copied === "link" ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student roster */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Students ({data.studentList?.length || 0})
              </h3>
              <button
                onClick={openEnrollModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Students
              </button>
            </div>

            {data.studentList?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Interviews
                      </th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Resumes
                      </th>
                      <th className="text-right py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentList.map((s: Student) => (
                      <tr
                        key={s._id}
                        className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            {s.profileImageUrl ? (
                              <img
                                src={s.profileImageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {s.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-slate-900 dark:text-white">
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {s.email}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            {s.interviewCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            {s.resumeCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setFeedbackStudent(s)}
                              className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                              title="Give feedback"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(s._id)}
                              disabled={removing === s._id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                              title="Remove student"
                            >
                              {removing === s._id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No students enrolled yet. Share the class code or add students
                manually.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Feedback Modal ──────────────────────────────────────────────── */}
      {feedbackStudent && (
        <FeedbackModal
          isOpen={!!feedbackStudent}
          onClose={() => setFeedbackStudent(null)}
          studentId={feedbackStudent._id}
          studentName={feedbackStudent.name}
          type="general"
        />
      )}


      {/* ── Enroll Students Modal ────────────────────────────────────────── */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Add Students
              </h3>
              <button
                onClick={() => {
                  setShowEnroll(false);
                  setSelectedIds([]);
                  setEnrollSearch("");
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={enrollSearch}
                  onChange={(e) => setEnrollSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              {selectedIds.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  {selectedIds.length} student{selectedIds.length > 1 ? "s" : ""}{" "}
                  selected
                </p>
              )}
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
                  {allStudents.length === 0
                    ? "No available students found"
                    : "No students match your search"}
                </p>
              ) : (
                filteredStudents.map((s) => (
                  <label
                    key={s._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleStudent(s._id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {s.email}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleEnroll}
                disabled={enrolling || selectedIds.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
              >
                {enrolling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Enroll {selectedIds.length > 0 ? selectedIds.length : ""}{" "}
                    Student{selectedIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
