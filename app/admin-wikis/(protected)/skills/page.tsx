import { createClient } from "@/lib/supabase/server";
import {
  createSkill,
  saveSkill,
  deleteSkill,
  createTechnology,
  saveTechnology,
  deleteTechnology,
} from "./actions";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Cpu,
  Layers,
  ExternalLink,
  Code2,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const SKILL_GROUPS = ["Build", "Design", "Think", "AI"] as const;
const TECH_CATEGORIES = [
  "Frontend",
  "Backend/Data",
  "Infrastructure",
  "Creative",
  "Business",
  "AI",
] as const;

export default async function SkillsAdminPage({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const s = await createClient();

  const [{ data: skills }, { data: technologies }] = await Promise.all([
    s.from("skills").select("*").order("sort_order", { ascending: true }),
    s.from("technologies").select("*").order("sort_order", { ascending: true }),
  ]);

  const skillList = skills ?? [];
  const techList = technologies ?? [];

  const visibleSkillsCount = skillList.filter((x) => x.is_visible).length;
  const visibleTechCount = techList.filter((x) => x.is_visible).length;

  return (
    <main className="mx-auto max-w-5xl space-y-10">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
            PAGES &amp; CONTENT / SKILLS &amp; TOOLKIT
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            Skills &amp; Working Toolkit
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your engineering disciplines, creative capabilities, and technology stack shown on your homepage and About page.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-white/40">
          <span>{skillList.length} skills ({visibleSkillsCount} live)</span>
          <span>·</span>
          <span>{techList.length} tools ({visibleTechCount} live)</span>
        </div>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold text-emerald-300">Skills &amp; Technologies updated in Supabase successfully!</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="font-semibold text-rose-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: CORE CAPABILITIES & SKILLS (Build, Design, Think, AI)
         ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6f8cff]/20 text-[#6f8cff]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Core Capabilities</h2>
              <p className="text-xs text-white/40">Displayed in the &quot;Capabilities&quot; grid on your homepage and About page.</p>
            </div>
          </div>
          <span className="font-mono text-xs text-white/30">{skillList.length} Total</span>
        </div>

        {/* Add Skill Form */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider font-mono">+ Add New Capability</p>
          <form action={createSkill} className="grid gap-3 sm:grid-cols-[1fr_160px_100px_100px_auto] sm:items-end">
            <div>
              <label className="block text-xs text-white/50 mb-1">Capability Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Full-Stack Web Development"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Group *</label>
              <select
                name="group"
                defaultValue="Build"
                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              >
                {SKILL_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={skillList.length * 10 + 10}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div className="pb-2">
              <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                <input name="visible" type="checkbox" defaultChecked className="rounded border-white/20" />
                <span>Live</span>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md h-[36px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Existing Skills List */}
        <div className="grid gap-3 sm:grid-cols-2">
          {skillList.map((skill) => (
            <div
              key={skill.id}
              className="rounded-xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-white/15"
            >
              <form action={saveSkill} className="space-y-3">
                <input type="hidden" name="id" value={skill.id} />
                <div className="flex items-center gap-2">
                  <input
                    name="name"
                    defaultValue={skill.name}
                    required
                    className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-white hover:border-white/20 focus:border-[#6f8cff] focus:bg-black/40 outline-none"
                  />
                  <span className="rounded bg-[#6f8cff]/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#6f8cff]">
                    {skill.group_name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.05] text-xs text-white/60">
                  <div className="flex items-center gap-3">
                    <select
                      name="group"
                      defaultValue={skill.group_name}
                      className="rounded border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-white"
                    >
                      {SKILL_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 text-[11px]">
                      <span>Order:</span>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={skill.sort_order}
                        className="w-12 rounded border border-white/10 bg-black/50 px-1.5 py-0.5 text-xs text-white"
                      />
                    </div>

                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        name="visible"
                        type="checkbox"
                        defaultChecked={skill.is_visible}
                        className="rounded border-white/20"
                      />
                      <span>Live</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white hover:bg-white/10"
                  >
                    Save
                  </button>
                </div>
              </form>

              <form action={deleteSkill} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={skill.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400/60 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  <span>Remove</span>
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: TOOLS & TECHNOLOGIES (Direct Icon/Image URL support)
         ========================================================================= */}
      <section className="space-y-6 pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Tools &amp; Technologies</h2>
              <p className="text-xs text-white/40">
                Languages, frameworks, database systems, and design software. Supports direct icon URLs to preserve Supabase storage!
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-white/30">{techList.length} Total</span>
        </div>

        {/* Add Technology Form */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider font-mono">+ Add Technology or Tool</p>
          <form action={createTechnology} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Technology Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Next.js, Supabase, TypeScript"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Category *</label>
              <select
                name="category"
                defaultValue="Frontend"
                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              >
                {TECH_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Direct Icon / SVG Image URL</label>
              <input
                name="iconUrl"
                placeholder="https://... (external URL)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Website URL (Optional)</label>
              <input
                name="websiteUrl"
                placeholder="https://..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={techList.length * 10 + 10}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div className="flex items-center justify-between pt-5">
              <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                <input name="visible" type="checkbox" defaultChecked className="rounded border-white/20" />
                <span>Live on portfolio</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Tool</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Technologies Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techList.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-white/15"
            >
              <form action={saveTechnology} className="space-y-3">
                <input type="hidden" name="id" value={t.id} />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                    {t.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.icon_url} alt={t.name} className="h-5 w-5 object-contain" />
                    ) : (
                      <Code2 className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                  <input
                    name="name"
                    defaultValue={t.name}
                    required
                    className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-xs font-semibold text-white hover:border-white/20 focus:border-[#6f8cff] focus:bg-black/40 outline-none"
                  />
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-400">
                    {t.category}
                  </span>
                </div>

                <div>
                  <input
                    name="iconUrl"
                    defaultValue={t.icon_url ?? ""}
                    placeholder="Icon URL: https://..."
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/80 outline-none focus:border-[#6f8cff]"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.05] text-xs text-white/60">
                  <select
                    name="category"
                    defaultValue={t.category}
                    className="rounded border border-white/10 bg-black/50 px-2 py-1 text-[10px] text-white"
                  >
                    {TECH_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        name="visible"
                        type="checkbox"
                        defaultChecked={t.is_visible}
                        className="rounded border-white/20"
                      />
                      <span>Live</span>
                    </label>

                    <button
                      type="submit"
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white hover:bg-white/10"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>

              <form action={deleteTechnology} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={t.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400/60 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  <span>Remove</span>
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
