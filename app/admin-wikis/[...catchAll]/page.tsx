import Link from "next/link";
import {
  LayoutDashboard,
  Database,
  Briefcase,
  Quote,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCatchAllNotFound({
  params,
}: {
  params: Promise<{ catchAll?: string[] }>;
}) {
  const resolved = await params;
  const path = resolved.catchAll?.join("/") || "";

  return (
    <main className="min-h-screen bg-[#080a10] text-white grid place-items-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0e14] p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-3 py-1 font-mono text-xs text-[#6f8cff]">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>404 / ADMIN CONTROL CENTER</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
          Admin Section Not Found
        </h1>

        <p className="text-sm leading-relaxed text-white/50 max-w-md mx-auto">
          The requested admin path <code className="font-mono text-xs text-[#6f8cff]">/admin-wikis/{path}</code> was moved, renamed, or is unavailable. Your Supabase database is safe.
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
              <p className="text-[11px] text-white/40">Portfolio overview</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/database"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Database &amp; SQL Hub</p>
              <p className="text-[11px] text-white/40">Check Supabase status</p>
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
              <p className="text-[11px] text-white/40">Manage builds</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/testimonials"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <Quote className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Testimonials</p>
              <p className="text-[11px] text-white/40">Client reviews</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/trash"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Trash &amp; Recovery</p>
              <p className="text-[11px] text-white/40">Restore deleted items</p>
            </div>
          </Link>

          <Link
            href="/admin-wikis/media"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs transition hover:bg-white/[0.08] hover:border-white/20"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f8cff]/15 text-[#6f8cff]">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Media Library</p>
              <p className="text-[11px] text-white/40">Uploads &amp; assets</p>
            </div>
          </Link>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Live Public Website</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
