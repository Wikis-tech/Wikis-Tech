import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";
import { signIn, saveAnonKeyFromLogin } from "./actions";
import { Shield, Key, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ error?: string; key_saved?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const env = getSupabaseEnv();
  const hasAnonKey =
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "placeholder-key";

  if (hasAnonKey) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getClaims();

      if (data?.claims?.sub) {
        redirect("/admin-wikis");
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
    }
  }

  const { error, key_saved } = await searchParams;

  let errorMessage: string | null = null;
  if (error === "unauthorized") {
    errorMessage = "This account is authenticated, but does not have the 'admin' or 'editor' role in public.profiles. Run the Admin Setup SQL to grant full access.";
  } else if (error === "no_api_key") {
    errorMessage = "Supabase Anon Key is missing. Paste your Anon key in the form below to connect your website to Supabase.";
  } else if (error === "missing") {
    errorMessage = "Please enter both your email and password.";
  } else if (error === "Invalid login credentials") {
    errorMessage = "Incorrect email or password. Verify credentials in your Supabase Auth dashboard or run the Admin Setup SQL to reset.";
  } else if (error) {
    errorMessage = error;
  }

  return (
    <main className="shell grid min-h-screen place-items-center py-12 px-4">
      <section className="surface w-full max-w-lg rounded-3xl p-6 sm:p-10 border border-white/10 bg-[#0c0e14] shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-[#6f8cff] uppercase">
            WIKIS TECH
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60">
            <Shield className="h-3 w-3 text-[#6f8cff]" />
            <span>Private CMS</span>
          </div>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
          Portfolio Control Center
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/50">
          Private access for approved portfolio administrators. Authenticated exclusively by your Supabase project.
        </p>

        {/* Success message on key saved */}
        {key_saved && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Supabase Connected Successfully!</p>
              <p className="mt-0.5 text-white/80">
                Your Supabase Anon Key has been saved. You can now sign in with your admin credentials below.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">Sign In Notice</p>
              <p className="mt-0.5 leading-relaxed text-white/85">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Connect Supabase Anon Key (if missing) */}
        {!hasAnonKey && (
          <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/[0.08] p-5 text-xs text-white/90 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Step 1: Connect Supabase API Key</span>
            </div>
            <p className="leading-relaxed text-white/75">
              Supabase requires your project&apos;s public <code className="text-amber-300 font-mono">anon</code> key to authenticate login requests and fetch portfolio content.
            </p>

            <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
              <p className="text-[11px] text-white/70">
                1. Go to your Supabase project:
              </p>
              <a
                href="https://supabase.com/dashboard/project/mgzvfhrnrrvbmajkrmgp/settings/api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#6f8cff] underline hover:text-white"
              >
                <span>Supabase &gt; Project Settings &gt; API ↗</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-[11px] text-white/70">
                2. Under <strong>Project API keys</strong>, copy the <strong className="text-amber-300">anon public</strong> key and paste it below:
              </p>
            </div>

            <form action={saveAnonKeyFromLogin} className="space-y-3">
              <textarea
                name="anonKey"
                required
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-[#6f8cff]"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
              >
                Save Anon Key &amp; Connect
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Sign In Form */}
        <form action={signIn} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium text-white/80" htmlFor="email">
              Admin Email
            </label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#6f8cff]"
              id="email"
              name="email"
              type="email"
              defaultValue="wikistech07@gmail.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-medium text-white/80" htmlFor="password">
                Password
              </label>
              <Link
                href="/admin-wikis/sql"
                className="text-[11px] text-[#6f8cff] hover:underline"
              >
                Forgot or need to set password?
              </Link>
            </div>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#6f8cff]"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="w-full rounded-xl bg-[#6f8cff] px-4 py-3 text-sm font-semibold text-[#050812] transition hover:bg-[#85a0ff] shadow-lg disabled:opacity-50"
            type="submit"
            disabled={!hasAnonKey}
          >
            {hasAnonKey ? "Sign In to CMS" : "Please Connect Supabase Anon Key Above"}
          </button>
        </form>

        {/* Helper Box */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-medium">
              <span className={`h-2 w-2 rounded-full ${hasAnonKey ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{hasAnonKey ? "Supabase Handshake Ready" : "Awaiting Supabase Key"}</span>
            </div>
            <Link
              href="/admin-wikis/sql"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6f8cff] underline hover:text-white"
            >
              SQL &amp; Database Hub ↗
            </Link>
          </div>

          <p className="leading-relaxed text-white/60">
            Target Project: <code className="text-[#6f8cff]">mgzvfhrnrrvbmajkrmgp.supabase.co</code>
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            <Link
              href="/admin-wikis/sql"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-3 py-1.5 text-[#6f8cff] hover:bg-[#6f8cff]/20 transition"
            >
              <span>View SQL Scripts &amp; Setup</span>
            </Link>
            <a
              href="https://supabase.com/dashboard/project/mgzvfhrnrrvbmajkrmgp/auth/users"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 hover:bg-white/10 transition"
            >
              <span>Supabase Auth &gt; Users ↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
