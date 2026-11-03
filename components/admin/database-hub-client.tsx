"use client";

import { useState } from "react";
import {
  RECOMMENDED_SETUP_SQL,
  ADMIN_SETUP_SQL,
  MIGRATIONS_CATALOG,
  type MigrationScript,
} from "@/lib/site/supabase-sql-scripts";
import {
  testSupabaseHandshake,
  saveSupabaseAnonKey,
  getMigrationFileSql,
  type HandshakeResult,
} from "@/app/admin-wikis/(protected)/database/actions";
import {
  Database,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileCode2,
  Key,
  Terminal,
  Activity,
  Server,
  Layers,
} from "lucide-react";

interface Props {
  currentUrl: string;
  hasAnonKey: boolean;
  initialHandshake: HandshakeResult | null;
}

export function DatabaseHubClient({ currentUrl, hasAnonKey, initialHandshake }: Props) {
  const [activeTab, setActiveTab] = useState<"recommended" | "adminUser" | "handshake" | "migrations">("recommended");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [testingHandshake, setTestingHandshake] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<HandshakeResult | null>(initialHandshake);
  const [savingKey, setSavingKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Migration file inspection state
  const [selectedMigration, setSelectedMigration] = useState<MigrationScript>(MIGRATIONS_CATALOG[0]);
  const [migrationSql, setMigrationSql] = useState<string>("");
  const [loadingMigration, setLoadingMigration] = useState(false);

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(label);
      setTimeout(() => setCopiedScript(null), 3000);
    } catch {
      // Fallback
    }
  }

  async function handleTestHandshake() {
    setTestingHandshake(true);
    try {
      const res = await testSupabaseHandshake();
      setHandshakeResult(res);
    } catch (err: any) {
      setHandshakeResult({
        success: false,
        message: err.message || "Failed to execute handshake test",
        url: currentUrl,
        latencyMs: 0,
        tablesChecked: {},
        authStatus: "Error",
      });
    } finally {
      setTestingHandshake(false);
    }
  }

  async function handleSaveCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingKey(true);
    setSaveMessage(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await saveSupabaseAnonKey(fd);
      setSaveMessage({ kind: "success", text: res.message });
      // Re-test handshake automatically
      await handleTestHandshake();
    } catch (err: any) {
      setSaveMessage({ kind: "error", text: err.message || "Could not save credentials." });
    } finally {
      setSavingKey(false);
    }
  }

  async function selectMigration(m: MigrationScript) {
    setSelectedMigration(m);
    setLoadingMigration(true);
    try {
      const sql = await getMigrationFileSql(m.filename);
      setMigrationSql(sql);
    } catch {
      setMigrationSql("-- Failed to read migration file");
    } finally {
      setLoadingMigration(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(111,140,255,0.08),rgba(11,13,18,0.96))] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#6f8cff]">
                Supabase Infrastructure &amp; Handshake
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Database Connection &amp; SQL Hub
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Connected to project:{" "}
              <code className="rounded bg-black/40 px-2 py-0.5 font-mono text-[#6f8cff]">
                {currentUrl}
              </code>
              . All website data across the public site and admin flows through your Supabase
              database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://supabase.com/dashboard/project/mgzvfhrnrrvbmajkrmgp/editor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/20"
            >
              Open Supabase SQL Editor
              <ExternalLink className="h-3.5 w-3.5 text-[#6f8cff]" />
            </a>
            <button
              type="button"
              onClick={handleTestHandshake}
              disabled={testingHandshake}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingHandshake ? "animate-spin" : ""}`} />
              <span>{testingHandshake ? "Pinging Database..." : "Test Live Handshake"}</span>
            </button>
          </div>
        </div>

        {/* Quick Connection Status Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/[0.08] pt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/40">Status:</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected (mgzvfhrnrrvbmajkrmgp)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Anon Key:</span>
            <span className={hasAnonKey ? "text-emerald-300 font-medium" : "text-amber-300 font-medium"}>
              {hasAnonKey ? "Configured ✓" : "Needs Publishable Key"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Stored Migrations:</span>
            <span className="font-mono text-white/80">{MIGRATIONS_CATALOG.length} SQL Files Available</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("recommended")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "recommended"
              ? "bg-[#6f8cff] text-[#050812] shadow-md shadow-[#6f8cff]/20"
              : "text-white/60 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>⭐️ 1. RLS Sync SQL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("adminUser")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "adminUser"
              ? "bg-[#6f8cff] text-[#050812] shadow-md shadow-[#6f8cff]/20"
              : "text-white/60 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>🔑 2. Admin Email &amp; Password SQL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("handshake")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "handshake"
              ? "bg-[#6f8cff] text-[#050812] shadow-md shadow-[#6f8cff]/20"
              : "text-white/60 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Live Handshake Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("migrations");
            if (!migrationSql) selectMigration(MIGRATIONS_CATALOG[0]);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "migrations"
              ? "bg-[#6f8cff] text-[#050812] shadow-md shadow-[#6f8cff]/20"
              : "text-white/60 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          <span>All 11 Migration Files</span>
        </button>
      </div>

      {/* TAB 1: RECOMMENDED SQL SCRIPT TO PASTE */}
      {activeTab === "recommended" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#6f8cff]/30 bg-[linear-gradient(160deg,rgba(111,140,255,0.06),rgba(11,13,18,0.95))] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6f8cff]/40 bg-[#6f8cff]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#6f8cff]">
                  Primary Action Required
                </span>
                <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  Paste this into your Supabase SQL Editor
                </h2>
                <p className="mt-1.5 text-xs text-white/60 leading-relaxed sm:text-sm">
                  Your tables (like <code className="text-[#6f8cff]">about_profile</code>,{" "}
                  <code className="text-[#6f8cff]">activity_logs</code>,{" "}
                  <code className="text-[#6f8cff]">services</code>,{" "}
                  <code className="text-[#6f8cff]">pricing_packages</code>) are already created in
                  your Supabase project. This script establishes the handshake by ensuring all
                  public read policies allow visitors to see published content without permissions
                  errors, and grants full CMS write powers to authenticated users.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(RECOMMENDED_SETUP_SQL, "recommended")}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 shadow-lg"
              >
                {copiedScript === "recommended" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Recommended SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 3-step guide */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-white/[0.08] pt-6">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                <span className="font-mono text-xs font-semibold text-[#6f8cff]">Step 1</span>
                <p className="mt-1 text-xs text-white/80 font-medium">Click &quot;Copy Recommended SQL&quot;</p>
                <p className="mt-0.5 text-[11px] text-white/40">Copies the full script to your clipboard.</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                <span className="font-mono text-xs font-semibold text-[#6f8cff]">Step 2</span>
                <p className="mt-1 text-xs text-white/80 font-medium">Open Supabase SQL Editor</p>
                <p className="mt-0.5 text-[11px] text-white/40">Go to your project &gt; SQL Editor &gt; New Query.</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                <span className="font-mono text-xs font-semibold text-[#6f8cff]">Step 3</span>
                <p className="mt-1 text-xs text-white/80 font-medium">Paste &amp; Click &quot;Run&quot;</p>
                <p className="mt-0.5 text-[11px] text-white/40">Applies in ~1 second with zero table drops.</p>
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-2xl border border-white/10 bg-[#06080e] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#6f8cff]" />
                <span className="font-mono text-xs font-semibold text-white/70">
                  supabase_handshake_rls_sync.sql
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(RECOMMENDED_SETUP_SQL, "recommended")}
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
              >
                {copiedScript === "recommended" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedScript === "recommended" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="max-h-[500px] overflow-auto p-5 font-mono text-xs text-white/80 leading-relaxed">
              <code>{RECOMMENDED_SETUP_SQL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN EMAIL & PASSWORD SQL */}
      {activeTab === "adminUser" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#6f8cff]/30 bg-[linear-gradient(160deg,rgba(111,140,255,0.06),rgba(11,13,18,0.95))] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6f8cff]/40 bg-[#6f8cff]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#6f8cff]">
                  Admin Credentials Setup
                </span>
                <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  Set or Reset Your Admin Email &amp; Password
                </h2>
                <p className="mt-1.5 text-xs text-white/60 leading-relaxed sm:text-sm">
                  Because Supabase is your sole database and authentication vault, admin accounts
                  live in your Supabase Auth (<code className="text-[#6f8cff]">auth.users</code>) table.
                  You can paste the script below in your Supabase SQL Editor to instantly set your
                  desired admin email and password with full administrator permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(ADMIN_SETUP_SQL, "adminSetup")}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 shadow-lg"
              >
                {copiedScript === "adminSetup" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Copied Admin SQL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Admin Setup SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick explanation cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-white/[0.08] pt-6">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <span className="font-mono text-xs font-semibold text-[#6f8cff]">Default Credentials in Script</span>
                <p className="mt-2 text-xs text-white/80">
                  Email: <code className="text-[#6f8cff] font-semibold">wikistech07@gmail.com</code>
                </p>
                <p className="mt-1 text-xs text-white/80">
                  Password: <code className="text-[#6f8cff] font-semibold">WisdomAdmin2026!</code>
                </p>
                <p className="mt-2 text-[11px] text-white/45">
                  You can edit either value directly in the script or in the Supabase SQL editor before running.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <span className="font-mono text-xs font-semibold text-[#6f8cff]">Alternative: Supabase UI</span>
                <p className="mt-2 text-xs text-white/80">
                  You can also go to{" "}
                  <a
                    href="https://supabase.com/dashboard/project/mgzvfhrnrrvbmajkrmgp/auth/users"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#6f8cff]"
                  >
                    Authentication &gt; Users ↗
                  </a>
                  , click <strong>&quot;Add user&quot;</strong>, enter your email and password, and check &quot;Auto confirm&quot;.
                </p>
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-2xl border border-white/10 bg-[#06080e] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#6f8cff]" />
                <span className="font-mono text-xs font-semibold text-white/70">
                  set_admin_credentials.sql
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ADMIN_SETUP_SQL, "adminSetup")}
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
              >
                {copiedScript === "adminSetup" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedScript === "adminSetup" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="max-h-[500px] overflow-auto p-5 font-mono text-xs text-white/80 leading-relaxed">
              <code>{ADMIN_SETUP_SQL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE HANDSHAKE DIAGNOSTICS */}
      {activeTab === "handshake" && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Live Results */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Live Endpoint Handshake</h3>
                <button
                  type="button"
                  onClick={handleTestHandshake}
                  disabled={testingHandshake}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                >
                  <RefreshCw className={`h-3 w-3 ${testingHandshake ? "animate-spin" : ""}`} />
                  <span>Run Diagnostics</span>
                </button>
              </div>

              {handshakeResult ? (
                <div className="mt-5 space-y-4">
                  <div
                    className={`rounded-xl border p-4 text-xs ${
                      handshakeResult.success
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    }`}
                  >
                    <p className="font-semibold">{handshakeResult.message}</p>
                    <p className="mt-1 opacity-75">
                      Target URL: {handshakeResult.url} · Latency: {handshakeResult.latencyMs}ms
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-3">
                      Table Communication Checks
                    </p>
                    <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-black/20">
                      {Object.entries(handshakeResult.tablesChecked).map(([tbl, res]) => (
                        <div key={tbl} className="flex items-center justify-between px-4 py-2.5 text-xs">
                          <span className="font-mono text-white/70">{tbl}</span>
                          <span
                            className={
                              typeof res === "string" && res.startsWith("Error")
                                ? "text-amber-400 font-mono"
                                : "text-emerald-400 font-mono font-medium"
                            }
                          >
                            {typeof res === "number" ? `${res} records verified` : String(res)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-white/40">
                  Click &quot;Run Diagnostics&quot; above to perform an instant handshake test with your
                  Supabase database.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Key Configuration Form */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[#6f8cff]" />
                <h3 className="text-base font-semibold text-white">Supabase API Credentials</h3>
              </div>
              <p className="mt-1.5 text-xs text-white/50 leading-relaxed">
                Configure your Supabase publishable anon key directly. It will be saved to{" "}
                <code>.env.local</code> and used for all database operations.
              </p>

              {saveMessage && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-xs ${
                    saveMessage.kind === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Supabase Project URL
                  </label>
                  <input
                    name="supabaseUrl"
                    defaultValue={currentUrl}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-[#6f8cff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Supabase Anon Public Key (Publishable)
                  </label>
                  <textarea
                    name="anonKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    rows={4}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-[#6f8cff]"
                  />
                  <span className="mt-1 block text-[11px] text-white/35">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={savingKey}
                  className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {savingKey ? "Saving Credentials..." : "Save Credentials & Connect"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL 11 SQL MIGRATIONS */}
      {activeTab === "migrations" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Migration Selector List */}
          <div className="space-y-2 lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-3">
              Migration Scripts ({MIGRATIONS_CATALOG.length})
            </p>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-2">
              {MIGRATIONS_CATALOG.map((m) => {
                const isSelected = selectedMigration.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectMigration(m)}
                    className={`w-full rounded-xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-[#6f8cff]/50 bg-[#6f8cff]/10"
                        : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-[#6f8cff]">
                        {m.filename}
                      </span>
                      <span className="text-[10px] text-white/40">{m.phase}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-white">{m.title}</p>
                    <p className="mt-1 text-[11px] text-white/50 line-clamp-2">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Migration Viewer */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#06080e] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.02] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-[#6f8cff]" />
                    <span className="font-mono text-xs font-semibold text-white">
                      {selectedMigration.filename}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">{selectedMigration.title}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(migrationSql, selectedMigration.id)}
                  disabled={loadingMigration}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {copiedScript === selectedMigration.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy This SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 border-b border-white/[0.06] bg-black/30">
                <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
                  Tables Affected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMigration.tablesAffected.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <pre className="max-h-[460px] overflow-auto p-4 font-mono text-xs text-white/80 leading-relaxed">
                <code>{loadingMigration ? "Loading SQL..." : migrationSql || "-- Select a migration"}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
