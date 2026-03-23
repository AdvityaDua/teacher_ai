"use client";
import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Star, 
  ExternalLink,
  RefreshCw,
  Trash2,
  Lightbulb
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { Feedback } from "@/types";
import clsx from "clsx";

export default function FeedbackHistoryPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getTeacherFeedback();
      setFeedbackList(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await api.deleteFeedback(id);
      setFeedbackList(prev => prev.filter(f => f._id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete");
    }
  };

  const filtered = feedbackList.filter(f => {
    const matchesSearch = 
      (typeof f.studentId === 'object' ? f.studentId.name : '').toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout 
      title="Feedback History" 
      subtitle="Manage the professional guidance and ratings you've provided"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-w-[140px]"
            >
              <option value="all">All Types</option>
              <option value="interview">Interviews</option>
              <option value="resume">Resumes</option>
              <option value="general">General</option>
            </select>
            <button 
              onClick={load}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className={clsx("w-4 h-4 text-slate-500", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-10 text-center rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
            <p className="text-rose-600 dark:text-rose-400 font-medium mb-4">{error}</p>
            <button onClick={load} className="text-indigo-600 font-bold hover:underline">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center rounded-3xl bg-white dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No feedback found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {search || filterType !== "all" ? "Try adjusting your filters" : "You haven't given any feedback yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((f) => (
              <div 
                key={f._id} 
                className="group bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {typeof f.studentId === 'object' ? f.studentId.name : 'Unknown Student'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(f.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      f.type === 'interview' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' :
                      f.type === 'resume' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400'
                    )}>
                      {f.type}
                    </div>
                    {f.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{f.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                    "{f.content}"
                  </p>
                </div>

                {f.suggestions && f.suggestions.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-1">Advised Steps</p>
                    <div className="space-y-1.5">
                      {f.suggestions.map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2 group/step">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-4">
                     <span className={clsx(
                       "text-[10px] font-bold uppercase flex items-center gap-1.5",
                       f.isRead ? "text-emerald-500" : "text-amber-500"
                     )}>
                       <div className={clsx("w-1.5 h-1.5 rounded-full", f.isRead ? "bg-emerald-500" : "bg-amber-500")} />
                       {f.isRead ? "Seen by student" : "Not seen yet"}
                     </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(f._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
