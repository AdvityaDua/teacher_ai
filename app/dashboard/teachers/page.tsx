"use client";
import { useEffect, useState } from "react";
import { Users, RefreshCw, Mail, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import clsx from "clsx";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const user = getStoredUser();
      const universityId = user?.universityId;
      if (!universityId) {
        setError("No university associated with your account.");
        setLoading(false);
        return;
      }
      const data = await api.getUniversityTeachers(universityId);
      // Response may be array or { teachers, university }
      if (Array.isArray(data)) {
        setTeachers(data);
      } else {
        setTeachers(data.teachers || []);
        setUniversity(data.university);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uniName = university?.name || "Your Institute";
  const currentUser = getStoredUser();

  function formatDate(ts?: string) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <DashboardLayout title="Teachers" subtitle={uniName}>
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

          {/* Header card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Institute Faculty</p>
              <h2 className="text-2xl font-extrabold text-white">{teachers.length} Teacher{teachers.length !== 1 ? "s" : ""}</h2>
              <p className="text-blue-200 text-sm mt-1">{uniName}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Grid */}
          {teachers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No teachers found for this institute.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teachers.map((t: any, i: number) => {
                const isSelf = t._id === currentUser?.id || t.email === currentUser?.email;
                return (
                  <div
                    key={t._id || i}
                    className={clsx(
                      "bg-white dark:bg-slate-800/60 rounded-2xl border p-6 flex flex-col gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5",
                      isSelf
                        ? "border-blue-300 dark:border-blue-600/60 shadow-blue-100/60 dark:shadow-blue-900/20"
                        : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden shadow">
                        {t.profileImageUrl ? (
                          <img src={t.profileImageUrl} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          t.name?.charAt(0)?.toUpperCase() || "T"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                          {isSelf && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                          {(t.role || "UNIVERSITY_TEACHER").replace(/_/g, " ").toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Joined {formatDate(t.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
