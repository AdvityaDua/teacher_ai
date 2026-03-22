"use client";
import { useEffect, useState } from "react";
import {
  Globe, Activity, Monitor, Smartphone, Tablet, RefreshCw, Clock,
  BarChart3, MapPin,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DonutChart from "@/components/charts/DonutChart";
import ActivityAreaChart from "@/components/charts/ActivityAreaChart";
import { api } from "@/lib/api";
import clsx from "clsx";

function DeviceIcon({ device }: { device: string }) {
  const d = (device || "").toLowerCase();
  if (d === "mobile" || d === "phone") return <Smartphone className="w-4 h-4" />;
  if (d === "tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
}

export default function TrafficPage() {
  const [summary, setSummary] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [sumRes, sessRes, dashRes] = await Promise.allSettled([
        api.getAnalyticsSummary(),
        api.getRecentSessions(30),
        api.getAdminDashboard(),
      ]);
      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (sessRes.status === "fulfilled") setSessions(sessRes.value?.sessions || sessRes.value || []);
      if (dashRes.status === "fulfilled") setDashData(dashRes.value);
    } catch (e: any) {
      setError(e.message || "Failed to load traffic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deviceData = Object.entries(dashData?.trafficMetrics?.devices || {}).map(
    ([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
      color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][i % 4],
    })
  );

  const sourceData = (dashData?.trafficMetrics?.sources || []).map((s: any, i: number) => ({
    name: s.source || "Direct",
    value: s.count,
    color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"][i % 5],
  }));

  const activityChart = dashData?.activityChart || [];
  const sessionList = Array.isArray(sessions) ? sessions : [];

  function formatDuration(start: string, end?: string) {
    if (!end) return "Active";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${secs % 60}s`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <DashboardLayout title="Traffic & Visitors" subtitle="Platform reach and session analytics">
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
        <div className="space-y-6">

          {/* Stats row */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Visitors", value: summary.totalVisitors, icon: Globe, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
                { label: "Total Sessions", value: summary.totalSessions, icon: Activity, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
                { label: "Total Page Views", value: summary.totalPageViews, icon: BarChart3, color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" },
                { label: "Active Sessions", value: summary.activeSessions, icon: Clock, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {(s.value || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Activity chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Daily Sessions & Users</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Last {activityChart.length} days</p>
              {activityChart.length > 0 ? (
                <ActivityAreaChart data={activityChart} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">No data</div>
              )}
            </div>

            {/* Devices donut */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Devices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Visitor device types</p>
              {deviceData.length > 0 ? (
                <DonutChart data={deviceData} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No data</div>
              )}
            </div>
          </div>

          {/* Sources + Popular pages */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Referral Sources</h3>
              {sourceData.length > 0 ? (
                <div className="space-y-3">
                  {sourceData.map((s: any, i: number) => {
                    const max = sourceData[0]?.value || 1;
                    const pct = Math.round((s.value / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs font-medium text-slate-400">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.name}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white ml-2 shrink-0">{s.value}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No source data</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Most Visited Pages</h3>
              {summary?.popularPages?.length > 0 ? (
                <div className="space-y-2">
                  {summary.popularPages.slice(0, 10).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-mono text-xs text-slate-600 dark:text-slate-300 truncate">{p._id}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                        {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No page data</p>
              )}
            </div>
          </div>

          {/* Recent sessions table */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent Sessions
                <span className="ml-2 text-xs font-medium text-slate-400">({sessionList.length})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50">
                    {["Session ID", "Country", "Device", "Pages", "Duration", "Started", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessionList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                        No recent sessions
                      </td>
                    </tr>
                  ) : (
                    sessionList.map((s: any, i: number) => (
                      <tr
                        key={s._id || s.sessionId || i}
                        className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {(s.sessionId || s._id || "").slice(0, 8)}…
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {s.country || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <DeviceIcon device={s.device} />
                            <span className="capitalize">{s.device || "Desktop"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">
                          {s.pageCount ?? 0}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                          {formatDuration(s.startTime, s.endTime)}
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                          {s.startTime ? formatTime(s.startTime) : "—"}
                        </td>
                        <td className="px-6 py-3">
                          <span className={clsx(
                            "text-[10px] font-bold px-2.5 py-1 rounded-full",
                            s.isActive
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          )}>
                            {s.isActive ? "● Active" : "Ended"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
