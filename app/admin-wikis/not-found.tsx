import Link from "next/link";
import { LayoutDashboard, Database, Briefcase, LogIn, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <main className="min-h-screen bg-[#080a10] text-white grid place-items-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0e14] p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-3 py-1 font-mono text-xs text-[#6f8cff]">
          <span>404 / ADMIN CONTROL CENTER</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
          This admin page was not found
        </h1>

        <p className="text-sm leading-relaxed text-white/50 max-w-md mx-auto">
          The requested admin section or resource URL may have moved or doesn&apos;t exist. Your database and portfolio settings remain intact.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 pt-2 text-left">
          <Link
            href="/admin-wikis"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Admin Dashboard</p>
              <p className="text-[11px] text-white/40">Manage your portfolio</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/projects"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Websites &amp; Apps</p>
              <p className="text-[11px] text-white/40">View all projects</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/database"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Database &amp; SQL Hub</p>
              <p className="text-[11px] text-white/40">Check Supabase status</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/login"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Sign In / Switch Account</p>
              <p className="text-[11px] text-white/40">Admin authentication</p>
            </div>
          </Link>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Live Portfolio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
