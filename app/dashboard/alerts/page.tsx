"use client";
import { useEffect, useState } from "react";
import {
  Bell,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Target,
  Zap,
  CheckCircle2,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { Alert } from "@/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e: any) {
      setError(e.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const handleRunChecks = async () => {
    setChecking(true);
    try {
      await api.triggerAlertChecks();
      await loadAlerts();
    } catch (e: any) {
      alert(e.message || "Failed to run checks");
    } finally {
      setChecking(false);
    }
  };

  const getAlertIconNameAndColor = (type: string) => {
    switch (type) {
      case "engagement":
        return { icon: Zap, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/30", label: "Engagement" };
      case "performance":
        return { icon: TrendingDown, color: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", label: "Performance" };
      case "risk":
        return { icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-900/30", label: "Risk" };
      default:
        return { icon: Target, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/30", label: "Usage" };
    }
  };

  return (
    <DashboardLayout
      title="Alerts Center"
      subtitle="AI-driven notifications for student performance and engagement"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleRunChecks}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Scanning Analytics..." : "Run AI Checks"}
          </button>
          
          <button
            onClick={handleMarkAllRead}
            disabled={alerts.every(a => a.isRead) || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-sm font-semibold rounded-xl transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 p-6">
          {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All clear!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">
            You have no active alerts. Click "Run AI Checks" to scan for new issues.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const { icon: Icon, color, label } = getAlertIconNameAndColor(alert.type);
            
            return (
              <div
                key={alert._id}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  alert.isRead
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      • {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${alert.isRead ? "text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-white"}`}>
                    {alert.message}
                  </p>
                  
                  {/* Context block if we have student info attached */}
                  {alert.student && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-w-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shrink-0">
                        {alert.student.profileImageUrl ? (
                          <img src={alert.student.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {alert.student.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {alert.student.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {alert.className || "Class Not Recorded"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkRead(alert._id)}
                    className="shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
