"use client";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: { name: string; email: string; profileImageUrl?: string } | null;
}

export default function Header({ title, subtitle, user }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || "T"
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
