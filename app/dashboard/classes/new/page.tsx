"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { Class } from "@/types";

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Class | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await api.createClass({
        name: name.trim(),
        department: department.trim() || undefined,
        semester: semester.trim() || undefined,
      });
      setCreated(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="Create New Class" subtitle="Set up a new class group">
      <button
        onClick={() => router.push("/dashboard/classes")}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Classes
      </button>

      {created ? (
        /* Success state */
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Class Created!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              &quot;{created.name}&quot; is ready. Share the code or link to add students.
            </p>

            {/* Class code */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-2">
                Class Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-[0.3em]">
                  {created.classCode}
                </code>
                <button
                  onClick={() => copyToClipboard(created.classCode, "code")}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Copy code"
                >
                  {copied === "code" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Invite link */}
            {created.inviteLink && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-2">
                  Invite Link
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    {created.inviteLink}
                  </code>
                  <button
                    onClick={() => copyToClipboard(created.inviteLink, "link")}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0"
                    title="Copy link"
                  >
                    {copied === "link" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/dashboard/classes/${created._id}`)}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
              >
                View Class
              </button>
              <button
                onClick={() => {
                  setCreated(null);
                  setName("");
                  setDepartment("");
                  setSemester("");
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form */
        <div className="max-w-lg mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5"
          >
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Class name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. "CSE 4th Year A"'
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder='e.g. "Computer Science"'
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder='e.g. "8th Semester"'
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
