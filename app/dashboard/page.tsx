"use client";
import { useEffect, useState } from "react";
import {
  Users, GraduationCap, Mic, FileText, TrendingUp,
  Globe, Activity, BarChart3, RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ActivityAreaChart from "@/components/charts/ActivityAreaChart";
import DonutChart from "@/components/charts/DonutChart";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

export default function OverviewPage() {
  const [uniData, setUniData] = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  // dashData only used for charts, not platform-wide stat cards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const user = getStoredUser();
      const universityId = user?.universityId;

      const [dash, sum, uni] = await Promise.allSettled([
        api.getAdminDashboard(),
        api.getAnalyticsSummary(),
        universityId ? api.getUniversityAnalytics(universityId) : Promise.resolve(null),
      ]);

      if (dash.status === "fulfilled") setDashData(dash.value);
      if (sum.status === "fulfilled") setSummary(sum.value);
      if (uni.status === "fulfilled") setUniData(uni.value);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = dashData?.overview;
  const uniStats = uniData?.stats;
  const uniName = uniData?.university?.name || "Your Institute";

  const topicData = (dashData?.contentMetrics?.popularTopics || []).map((t: any, i: number) => ({
    name: t.topic || "Unknown",
    value: t.count,
    color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"][i % 5],
  }));

  const deviceData = Object.entries(dashData?.trafficMetrics?.devices || {}).map(
    ([name, value], i) => ({
      name,
      value: value as number,
      color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][i % 4],
    })
  );

  const activityChart = dashData?.activityChart || [];

  return (
    <DashboardLayout title="Overview" subtitle={uniName}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-6 text-sm flex items-center gap-3">
          <span className="font-semibold">Error:</span> {error}
          <button onClick={load} className="ml-auto flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Institute stats (if teacher) */}
          {uniStats && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Institute — {uniName}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Students" value={uniStats.totalStudents} icon={GraduationCap} color="blue" />
                <StatCard label="Total Teachers" value={uniStats.totalTeachers} icon={Users} color="violet" />
                <StatCard label="Interviews Done" value={uniStats.totalInterviews} icon={Mic} color="emerald"
                  sub={`Limit: ${uniStats.interviewLimit}/student`} />
                <StatCard label="Resumes Created" value={uniStats.totalResumes} icon={FileText} color="amber"
                  sub={`Limit: ${uniStats.resumeLimit}/student`} />
              </div>
            </section>
          )}

          {/* Traffic summary */}
          {summary && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Traffic Summary
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Visitors" value={summary.totalVisitors} icon={Globe} color="blue" />
                <StatCard label="Total Sessions" value={summary.totalSessions} icon={Activity} color="emerald" />
                <StatCard label="Page Views" value={summary.totalPageViews} icon={BarChart3} color="violet" />
                <StatCard label="Active Now" value={summary.activeSessions} icon={TrendingUp} color="rose"
                  trend={{ value: "live", up: true }} />
              </div>
            </section>
          )}

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Activity chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sessions & Active Users</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily platform activity</p>
                </div>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold px-2.5 py-1 rounded-full">
                  {activityChart.length}d
                </span>
              </div>
              {activityChart.length > 0 ? (
                <ActivityAreaChart data={activityChart} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                  No activity data available
                </div>
              )}
            </div>

            {/* Devices donut */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Device Types</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Visitor device breakdown</p>
              </div>
              {deviceData.length > 0 ? (
                <DonutChart data={deviceData} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                  No device data available
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: Popular topics + Traffic sources */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Popular topics */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Popular Interview Topics</h3>
              {topicData.length > 0 ? (
                <div className="space-y-3">
                  {topicData.slice(0, 8).map((t: any, i: number) => {
                    const max = topicData[0]?.value || 1;
                    const pct = Math.round((t.value / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-5 shrink-0">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                              {t.name}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white ml-2 shrink-0">
                              {t.value}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: t.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">No topic data</p>
              )}
            </div>

            {/* Traffic sources */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Traffic Sources</h3>
              {dashData?.trafficMetrics?.sources?.length > 0 ? (
                <div className="space-y-3">
                  {dashData.trafficMetrics.sources.slice(0, 8).map((s: any, i: number) => {
                    const max = dashData.trafficMetrics.sources[0]?.count || 1;
                    const pct = Math.round((s.count / max) * 100);
                    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-5 shrink-0">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                              {s.source || "Direct"}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white ml-2 shrink-0">
                              {s.count}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">No source data</p>
              )}
            </div>
          </div>

          {/* Top popular pages */}
          {summary?.popularPages?.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Most Visited Pages</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {summary.popularPages.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate font-mono text-xs">
                      {p._id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                      {p.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
