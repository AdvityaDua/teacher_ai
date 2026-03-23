"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, TrendingDown, Target, Zap } from "lucide-react";
import { api } from "@/lib/api";

export function AlertsDropdown() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const { count } = await api.getUnreadAlertsCount();
      setUnreadCount(count);
    } catch (e) {
      console.error("Failed to fetch unread alerts", e);
    }
  };

  useEffect(() => {
    fetchUnread();
    // Poll every 3 minutes
    const interval = setInterval(fetchUnread, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => router.push("/dashboard/alerts")}
      className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
      )}
    </button>
  );
}
