"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ClipboardList,
  RefreshCw,
  ChevronRight,
  Clock,
  Target,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { Assignment } from "@/types";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30";
      case "hard":
        return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30";
      default:
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
    }
  };

  const getDaysRemaining = (dateString: string) => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days left`;
  };

  return (
    <DashboardLayout title="Assignments" subtitle="Manage interview assignments">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign structured interview practice to your classes
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/assignments/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
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
      ) : assignments.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
            No assignments yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">
            Create an assignment to set goals for your students and track
            their progress automatically.
          </p>
          <button
            onClick={() => router.push("/dashboard/assignments/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Assignment
          </button>
        </div>
      ) : (
        /* Assignment grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => {
            const pct = assignment.completionPercent || 0;
            const daysLeftText = getDaysRemaining(assignment.deadline);
            const isOverdue = daysLeftText === "Overdue";

            return (
              <div
                key={assignment._id}
                onClick={() =>
                  router.push(`/dashboard/assignments/${assignment._id}`)
                }
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/5 transition-all cursor-pointer group flex flex-col"
              >
                {/* Top section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {assignment.className}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    {assignment.topic}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${getDifficultyColor(
                      assignment.difficulty
                    )}`}
                  >
                    {assignment.difficulty}
                  </span>
                </div>

                <div className="mt-auto space-y-4">
                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>{assignment.numInterviews} interviews</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        isOverdue ? "text-red-500 font-medium" : ""
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{daysLeftText}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {assignment.completedCount} / {assignment.studentCount}{" "}
                        completed
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          pct === 100
                            ? "bg-emerald-500"
                            : "bg-blue-600 dark:bg-blue-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
