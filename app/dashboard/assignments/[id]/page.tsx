"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Target,
  RefreshCw,
  Trash2,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import FeedbackModal from "@/components/FeedbackModal";
import { api } from "@/lib/api";
import type { AssignmentDetail, StudentAssignment } from "@/types";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [data, setData] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [feedbackStudent, setFeedbackStudent] = useState<{ id: string; name: string } | null>(null);


  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await api.getAssignment(assignmentId);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assignmentId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    setDeleting(true);
    try {
      await api.deleteAssignment(assignmentId);
      router.push("/dashboard/assignments");
    } catch (e: any) {
      alert(e.message || "Failed to delete");
      setDeleting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30";
      case "hard":
        return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30";
      default:
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "evaluated":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            Assigned
          </span>
        );
    }
  };

  return (
    <DashboardLayout
      title={data?.title || "Assignment Detail"}
      subtitle={data?.className || undefined}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard/assignments")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>

        {data && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        )}
      </div>

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
          {/* Tags */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
              {data.topic}
            </span>
            <span
              className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border ${getDifficultyColor(
                data.difficulty
              )}`}
            >
              {data.difficulty} Wait for
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Assigned"
              value={data.stats.totalStudents}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Completion"
              value={`${data.stats.completionPercent}%`}
              icon={CheckCircle2}
              color="emerald"
              trend={{ value: `${data.stats.completed} done`, up: true }}
            />
            <StatCard
              label="In Progress"
              value={data.stats.inProgress}
              icon={Clock}
              color="amber"
              trend={{ value: `${data.stats.notStarted} not started`, up: false }}
            />
            <StatCard
              label="Avg. Score"
              value={`${data.stats.avgScore}/100`}
              icon={Target}
              color="violet"
            />
          </div>

          {/* Student Progress Table */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Progress
              </h3>
            </div>

            {data.studentProgress?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Interviews Done
                      </th>
                      <th className="text-center py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="text-right py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentProgress.map((sa: StudentAssignment) => (
                      <tr
                        key={sa._id}
                        className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Name/Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            {sa.profileImageUrl ? (
                              <img
                                src={sa.profileImageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {(sa.studentName || "?").charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {sa.studentName || "Unknown Student"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {sa.studentEmail || "No email"}
                                </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {getStatusBadge(sa.status)}
                        </td>

                        {/* Count */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {sa.completedInterviews}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {data.numInterviews}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-3 text-center">
                          {sa.avgScore > 0 ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              sa.avgScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              sa.avgScore >= 60 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}>
                              {sa.avgScore}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        
                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setFeedbackStudent({ id: sa.studentId, name: sa.studentName || "Student" })}
                            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            title="Give feedback"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No students are assigned to this task.
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
          studentId={feedbackStudent.id}
          studentName={feedbackStudent.name}
          type="interview"
          assignmentId={assignmentId}
        />
      )}

    </DashboardLayout>
  );
}
