"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Search, GraduationCap, Mic, FileText, RefreshCw,
  ChevronUp, ChevronDown, Download, Trophy, Medal, Award,
  Star, TrendingUp, Crown, Mail, CheckCircle, AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import clsx from "clsx";

type SortKey = "name" | "interviews" | "resumes" | "interviewPct" | "resumePct";
type SortDir = "asc" | "desc";
type Tab = "leaderboard" | "all";

/* ── thin progress bar ─────────────────────────────────────────────── */
function UsageBar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warn = pct >= 90;
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1">
        <span className={clsx("font-semibold", warn ? "text-red-500" : "text-slate-600 dark:text-slate-300")}>
          {used} / {limit}
        </span>
        <span className={clsx("font-medium", warn ? "text-red-400" : "text-slate-400 dark:text-slate-500")}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: warn ? "#ef4444" : color }}
        />
      </div>
    </div>
  );
}

/* ── rank medal ────────────────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-300/50">
        <Crown className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-500 flex items-center justify-center">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
        <Award className="w-4 h-4 text-white" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{rank}</span>
    </div>
  );
}

/* ── score ring ────────────────────────────────────────────────────── */
function ScoreRing({ score, max = 100, color }: { score: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-700" />
        <circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="4"
          stroke={color}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
    </div>
  );
}

/* ── excel export ──────────────────────────────────────────────────── */
async function exportToExcel(students: any[], uniName: string) {
  const XLSX = await import("xlsx");
  const rows = students.map((s, i) => ({
    Rank: i + 1,
    Name: s.name || "",
    Email: s.email || "",
    "Roll No.": s.rollNumber || "",
    "Interviews Done": s.interviews,
    "Interview Limit": s.interviewLimit,
    "Interview Usage %": Math.round(s.interviewPct),
    "Resumes Created": s.resumes,
    "Resume Limit": s.resumeLimit,
    "Resume Usage %": Math.round(s.resumePct),
    "Overall Score": s.score,
    Status:
      s.interviewPct >= 90 || s.resumePct >= 90
        ? "Near Limit"
        : s.interviews > 0 || s.resumes > 0
        ? "Active"
        : "Inactive",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  /* column widths */
  ws["!cols"] = [
    { wch: 6 }, { wch: 24 }, { wch: 30 }, { wch: 12 },
    { wch: 16 }, { wch: 14 }, { wch: 18 },
    { wch: 16 }, { wch: 12 }, { wch: 16 },
    { wch: 14 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  /* summary sheet */
  const total = students.length;
  const active = students.filter((s) => s.interviews > 0 || s.resumes > 0).length;
  const avgScore = total ? Math.round(students.reduce((a, s) => a + s.score, 0) / total) : 0;
  const nearLimit = students.filter((s) => s.interviewPct >= 90 || s.resumePct >= 90).length;
  const sumRows = [
    { Metric: "Institute", Value: uniName },
    { Metric: "Total Students", Value: total },
    { Metric: "Active Students", Value: active },
    { Metric: "Average Score", Value: `${avgScore}%` },
    { Metric: "Near Limit", Value: nearLimit },
    { Metric: "Report Date", Value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ];
  const ws2 = XLSX.utils.json_to_sheet(sumRows);
  ws2["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, `student_report_${Date.now()}.xlsx`);
}

/* ══════════════════════ MAIN PAGE ═════════════════════════════════ */
export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "interviews", dir: "desc" });
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [exporting, setExporting] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

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
      const data = await api.getUniversityStudents(universityId);
      setStudents(data.students || []);
      setUniversity(data.university);
    } catch (e: any) {
      setError(e.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setOrder = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  };

  /* enrich + compute score */
  const enriched = useMemo(() =>
    students.map((s) => {
      const interviews = s.interviewUsage?.used ?? s.interviewCount ?? 0;
      const interviewLimit = s.interviewUsage?.limit ?? 10;
      const resumes = s.resumeUsage?.used ?? s.resumeCount ?? 0;
      const resumeLimit = s.resumeUsage?.limit ?? 5;
      const interviewPct = interviewLimit > 0 ? (interviews / interviewLimit) * 100 : 0;
      const resumePct = resumeLimit > 0 ? (resumes / resumeLimit) * 100 : 0;
      // composite score: weighted avg of usage percentages
      const score = Math.round(interviewPct * 0.6 + resumePct * 0.4);
      return { ...s, interviews, interviewLimit, resumes, resumeLimit, interviewPct, resumePct, score };
    }),
  [students]);

  /* leaderboard: sorted by score descending */
  const leaderboard = useMemo(() =>
    [...enriched].sort((a, b) => b.score - a.score),
  [enriched]);

  /* filtered all-students table */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        if (sort.key === "name") return dir * (a.name || "").localeCompare(b.name || "");
        return dir * ((a[sort.key] ?? 0) - (b[sort.key] ?? 0));
      });
  }, [enriched, search, sort]);

  const uniName = university?.name || "Your Institute";
  const topByInterviews = leaderboard.filter((s) => s.interviews > 0)[0];
  const topByResumes   = [...enriched].sort((a, b) => b.resumes - a.resumes).filter((s) => s.resumes > 0)[0];
  const mostActive     = leaderboard[0];

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? (
      sort.dir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  const handleExport = async () => {
    setExporting(true);
    try { await exportToExcel(leaderboard, uniName); } finally { setExporting(false); }
  };

  const handleEmailReport = async () => {
    const user = getStoredUser();
    const universityId = user?.universityId;
    if (!universityId) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await api.triggerUniversityReport(universityId);
      setEmailResult({ success: res.success, message: res.message });
    } catch (e: any) {
      setEmailResult({ success: false, message: e.message || "Failed to send report" });
    } finally {
      setEmailSending(false);
      setTimeout(() => setEmailResult(null), 6000);
    }
  };

  return (
    <DashboardLayout title="Students" subtitle={uniName}>
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

          {/* ── top stat tiles ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: students.length, icon: GraduationCap, clr: "blue" },
              {
                label: "Avg Interviews",
                value: enriched.length ? (enriched.reduce((s, x) => s + x.interviews, 0) / enriched.length).toFixed(1) : 0,
                icon: Mic, clr: "emerald",
              },
              {
                label: "Avg Resumes",
                value: enriched.length ? (enriched.reduce((s, x) => s + x.resumes, 0) / enriched.length).toFixed(1) : 0,
                icon: FileText, clr: "violet",
              },
              {
                label: "Near Limit (≥90%)",
                value: enriched.filter((s) => s.interviewPct >= 90 || s.resumePct >= 90).length,
                icon: TrendingUp, clr: "rose",
              },
            ].map((t, i) => {
              const clrMap: Record<string, string> = {
                blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                violet:  "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
                rose:    "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
              };
              const Icon = t.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-3", clrMap[t.clr])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{t.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.label}</div>
                </div>
              );
            })}
          </div>

          {/* ── best performers highlight row ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Most Interviews",
                student: topByInterviews,
                stat: topByInterviews ? `${topByInterviews.interviews} interviews` : "No data",
                icon: <Mic className="w-5 h-5" />,
                color: "#3b82f6",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                label: "Most Resumes",
                student: topByResumes,
                stat: topByResumes ? `${topByResumes.resumes} resumes` : "No data",
                icon: <FileText className="w-5 h-5" />,
                color: "#8b5cf6",
                gradient: "from-violet-500 to-violet-600",
              },
              {
                label: "Top Overall Score",
                student: mostActive,
                stat: mostActive ? `${mostActive.score}% score` : "No data",
                icon: <Star className="w-5 h-5" />,
                color: "#f59e0b",
                gradient: "from-amber-400 to-amber-500",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4"
              >
                <div className={clsx("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg shrink-0", card.gradient)}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">{card.label}</p>
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {card.student?.name || "—"}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: card.color }}>{card.stat}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── tabs + action buttons ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {(["leaderboard", "all"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                    tab === t
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {t === "leaderboard" ? "🏆 Leaderboard" : "📋 All Students"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* email result toast */}
              {emailResult && (
                <div className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold animate-in fade-in",
                  emailResult.success
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
                )}>
                  {emailResult.success
                    ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  {emailResult.message}
                </div>
              )}

              {/* email report to teachers */}
              <button
                onClick={handleEmailReport}
                disabled={emailSending || enriched.length === 0}
                title="Email Excel report to all teachers of this institute"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
              >
                {emailSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Email Report to Teachers
              </button>

              {/* download local excel */}
              <button
                onClick={handleExport}
                disabled={exporting || enriched.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Excel Report
              </button>
            </div>
          </div>

          {/* ══ LEADERBOARD TAB ══ */}
          {tab === "leaderboard" && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* podium — top 3 */}
              {leaderboard.length >= 3 && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-blue-900/10 px-6 pt-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
                    Top Performers
                  </h3>
                  <div className="flex items-end justify-center gap-4">
                    {/* 2nd */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-4 border-slate-300 dark:border-slate-500">
                          {leaderboard[1]?.profileImageUrl
                            ? <img src={leaderboard[1].profileImageUrl} alt="" className="w-full h-full object-cover" />
                            : leaderboard[1]?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-slate-800">2</div>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate text-center">{leaderboard[1]?.name}</p>
                      <div className="bg-slate-200 dark:bg-slate-600 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">{leaderboard[1]?.score}%</div>
                      <div className="h-16 w-20 bg-slate-200 dark:bg-slate-700 rounded-t-xl" />
                    </div>
                    {/* 1st */}
                    <div className="flex flex-col items-center gap-2 -mt-4">
                      <Trophy className="w-6 h-6 text-amber-400" />
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden border-4 border-amber-300 shadow-lg shadow-amber-300/50">
                          {leaderboard[0]?.profileImageUrl
                            ? <img src={leaderboard[0].profileImageUrl} alt="" className="w-full h-full object-cover" />
                            : leaderboard[0]?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-slate-800">1</div>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white max-w-[80px] truncate text-center">{leaderboard[0]?.name}</p>
                      <div className="bg-amber-100 dark:bg-amber-900/40 rounded-lg px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">{leaderboard[0]?.score}%</div>
                      <div className="h-24 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-t-xl border-2 border-amber-200 dark:border-amber-800/50" />
                    </div>
                    {/* 3rd */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-4 border-amber-600/50">
                          {leaderboard[2]?.profileImageUrl
                            ? <img src={leaderboard[2].profileImageUrl} alt="" className="w-full h-full object-cover" />
                            : leaderboard[2]?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-slate-800">3</div>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate text-center">{leaderboard[2]?.name}</p>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-500">{leaderboard[2]?.score}%</div>
                      <div className="h-10 w-20 bg-amber-50 dark:bg-amber-900/20 rounded-t-xl" />
                    </div>
                  </div>
                </div>
              )}

              {/* full ranked list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-12">No students yet</p>
                ) : (
                  leaderboard.map((s, i) => (
                    <div
                      key={s._id || i}
                      className={clsx(
                        "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30",
                        i < 3 && "bg-slate-50/50 dark:bg-slate-800/50"
                      )}
                    >
                      <RankBadge rank={i + 1} />

                      {/* avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                        {s.profileImageUrl
                          ? <img src={s.profileImageUrl} alt={s.name} className="w-full h-full object-cover" />
                          : s.name?.charAt(0)?.toUpperCase()}
                      </div>

                      {/* name / email */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{s.email}</p>
                      </div>

                      {/* stats */}
                      <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Interviews</p>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{s.interviews}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Resumes</p>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{s.resumes}</p>
                        </div>
                      </div>

                      {/* score ring */}
                      <ScoreRing
                        score={s.score}
                        color={i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#3b82f6"}
                      />

                      {/* status chip */}
                      <span className={clsx(
                        "hidden lg:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0",
                        s.interviewPct >= 90 || s.resumePct >= 90
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : s.score >= 50
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : s.score > 0
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      )}>
                        {s.interviewPct >= 90 || s.resumePct >= 90 ? "Near Limit"
                          : s.score >= 50 ? "Active" : s.score > 0 ? "Low Usage" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══ ALL STUDENTS TAB ══ */}
          {tab === "all" && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 gap-4 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  All Students
                  <span className="ml-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {filtered.length} of {students.length}
                  </span>
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email or roll no."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-4 h-9 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      {(
                        [
                          { key: "name", label: "Student" },
                          { key: "interviews", label: "Interviews" },
                          { key: "resumes", label: "Resumes" },
                          { key: "interviewPct", label: "Interview Usage" },
                          { key: "resumePct", label: "Resume Usage" },
                        ] as { key: SortKey; label: string }[]
                      ).map((col) => (
                        <th
                          key={col.key}
                          onClick={() => setOrder(col.key)}
                          className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          {col.label} <SortIcon k={col.key} />
                        </th>
                      ))}
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">No students found</td>
                      </tr>
                    ) : (
                      filtered.map((student, i) => (
                        <tr
                          key={student._id || i}
                          className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                {student.profileImageUrl
                                  ? <img src={student.profileImageUrl} alt={student.name} className="w-full h-full object-cover" />
                                  : student.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {student.email}
                                  {student.rollNumber && (
                                    <span className="ml-2 font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{student.rollNumber}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 dark:text-white">{student.interviews}</span>
                            <span className="text-slate-400 text-xs"> / {student.interviewLimit}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 dark:text-white">{student.resumes}</span>
                            <span className="text-slate-400 text-xs"> / {student.resumeLimit}</span>
                          </td>
                          <td className="px-6 py-4 min-w-[140px]">
                            <UsageBar used={student.interviews} limit={student.interviewLimit} color="#3b82f6" />
                          </td>
                          <td className="px-6 py-4 min-w-[140px]">
                            <UsageBar used={student.resumes} limit={student.resumeLimit} color="#8b5cf6" />
                          </td>
                          <td className="px-6 py-4">
                            <ScoreRing score={student.score} color="#3b82f6" />
                          </td>
                          <td className="px-6 py-4">
                            <span className={clsx(
                              "text-[10px] font-bold px-2.5 py-1 rounded-full",
                              student.interviewPct >= 90 || student.resumePct >= 90
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : student.score >= 50
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : student.score > 0
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                            )}>
                              {student.interviewPct >= 90 || student.resumePct >= 90 ? "Near Limit"
                                : student.score >= 50 ? "Active"
                                : student.score > 0 ? "Low Usage" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}

