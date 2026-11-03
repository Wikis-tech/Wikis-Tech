import Link from "next/link";
import { DatabaseHubClient } from "@/components/admin/database-hub-client";
import { testSupabaseHandshake } from "@/app/admin-wikis/(protected)/database/actions";
import { getSupabaseEnv } from "@/lib/env";
import { ArrowLeft, Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSqlSetupPage() {
  const env = getSupabaseEnv();
  const currentUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey =
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "placeholder-key";

  const initialHandshake = await testSupabaseHandshake();

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin-wikis/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
            <div className="hidden sm:block">
              <span className="font-mono text-[11px] text-[#6f8cff]">WIKIS TECH</span>
              <p className="text-sm font-semibold">Supabase &amp; Admin SQL Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Supabase-Only Architecture</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DatabaseHubClient
          currentUrl={currentUrl}
          hasAnonKey={hasAnonKey}
          initialHandshake={initialHandshake}
        />
      </main>
    </div>
  );
}
