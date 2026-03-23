"use client";

import { useState } from "react";
import { X, Star, MessageSquare, Lightbulb, Save, Info } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  type?: "interview" | "resume" | "general";
  resultId?: string;
  assignmentId?: string;
  onSuccess?: () => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  type = "general",
  resultId,
  assignmentId,
  onSuccess,
}: FeedbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([""]);
  const [selectedType, setSelectedType] = useState<"interview" | "resume" | "general">(type);

  if (!isOpen) return null;

  const handleAddSuggestion = () => {
    setSuggestions([...suggestions, ""]);
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index] = value;
    setSuggestions(newSuggestions);
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const filteredSuggestions = suggestions.filter((s) => s.trim() !== "");
      await api.createFeedback({
        studentId,
        type: selectedType,
        content,
        rating: rating > 0 ? rating : undefined,
        suggestions: filteredSuggestions,
        resultId,
        assignmentId,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Give Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Providing guidance for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{studentName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Feedback Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="interview">Interview Assessment</option>
              <option value="resume">Resume Review</option>
              <option value="general">General Guidance</option>
            </select>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={clsx(
                      "w-8 h-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200 dark:text-slate-700 hover:text-amber-200 dark:hover:text-amber-900"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                {rating > 0 ? `${rating} / 5 stars` : "Click to rate"}
              </span>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Comments</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed feedback on the student's performance..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Actionable Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Actionable Next Steps</label>
              <button
                type="button"
                onClick={handleAddSuggestion}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={suggestion}
                      onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      placeholder="e.g. Focus on edge cases in DSA"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  {suggestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestion(index)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            onClick={handleSubmit}
            className="flex-[2] px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
