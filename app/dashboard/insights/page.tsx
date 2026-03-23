"use client";
import { useEffect, useState } from "react";
import {
  Brain,
  AlertTriangle,
  Award,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { TeacherInsights, StudentInsight } from "@/types";

export default function InsightsPage() {
  const [insights, setInsights] = useState<TeacherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getTeacherInsights();
      setInsights(data);
    } catch (e: any) {
      setError(e.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const StudentList = ({ students, type }: { students: StudentInsight[], type: 'risk' | 'ready' }) => {
    if (students.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No students currently fit this criteria.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shrink-0">
                {s.avatar ? (
                  <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {s.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-slate-500">{s.interviewsCompleted} interviews completed</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              type === 'ready' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {s.averageScore > 0 ? `${s.averageScore}% avg` : 'No scores'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="AI Insights"
      subtitle="Data-driven intelligence aggregating all student performances"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 p-6 flex items-center gap-4">
          <span>{error}</span>
          <button onClick={loadData} className="text-sm font-semibold hover:underline">Retry</button>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          
          {/* Top Weaknesses (Class Level) */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Capability Gaps</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lowest scoring topics across all your classes</p>
              </div>
            </div>

            {(!insights.topWeaknesses || insights.topWeaknesses.length === 0) ? (
              <p className="text-sm text-center text-slate-500 py-4">Not enough data collected yet to determine weaknesses.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.topWeaknesses.map((w) => (
                  <div key={w.topic} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate pr-2" title={w.topic}>
                        {w.topic.replace(/_/g, ' ')}
                      </h4>
                      <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{w.averageScore}%</span>
                      <span className="text-xs font-semibold text-rose-600/60 dark:text-rose-400/60 uppercase">Avg Score</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* At Risk List */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">At-Risk Students</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Poor performance or low activity</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-[300px]">
                <StudentList students={insights.atRiskStudents} type="risk" />
              </div>
            </div>

            {/* Placement Ready List */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Placement Ready</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Consistent high performers</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-[300px]">
                <StudentList students={insights.placementReadyStudents} type="ready" />
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </DashboardLayout>
  );
}
