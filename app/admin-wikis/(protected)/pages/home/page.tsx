import { createClient } from "@/lib/supabase/server";
import { saveHome } from "./actions";
import { CheckCircle2, AlertTriangle, ExternalLink, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const DEFAULT_HERO = {
  eyebrow: "OKOH WISDOM / WIKIS TECH",
  headline_line_1: "Okoh Wisdom",
  headline_line_2: "Uchechukwu",
  supporting_text:
    "I build websites & digital products that MOVE. I turn ideas and business problems into useful websites, digital products and intelligent tools — combining software, design, AI and strategy.",
  hero_media_url: "/wikis.png",
  rotating_words: ["MOVE", "WORK", "SCALE", "CONVERT", "INSPIRE"],
  rotation_interval_ms: 2200,
  rotation_enabled: true,
  availability_enabled: true,
  availability_message: "Available for select freelance contracts & advisory.",
  primary_cta_label: "View My Work",
  primary_cta_url: "/work",
  secondary_cta_label: "Let's Talk",
  secondary_cta_url: "/contact",
};

export default async function HomeEditor({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const s = await createClient();

  const [{ data: heroRow }, { data: sections }] = await Promise.all([
    s.from("hero_settings").select("*").eq("singleton_key", "default").maybeSingle(),
    s.from("page_sections").select("*").eq("page_key", "home").order("sort_order"),
  ]);

  const h = heroRow || DEFAULT_HERO;
  const words = Array.isArray(h.rotating_words)
    ? h.rotating_words.join("\n")
    : DEFAULT_HERO.rotating_words.join("\n");

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
            CONTENT / HOME
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
            Homepage Editor
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Edit hero copy, headline lines, rotating words, portrait media, and section order.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
        >
          <span>View Live Homepage</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#6f8cff]" />
        </Link>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">Homepage Published Successfully!</p>
            <p className="mt-0.5 text-white/80">
              All hero copy and section configurations have synced to Supabase and are live.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Unable to Save Changes</p>
            <p className="mt-0.5 text-white/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form action={saveHome} className="space-y-8">
        {/* Hero Section Card */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">Hero Header Configuration</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Eyebrow Tag" name="eyebrow" defaultValue={h.eyebrow} placeholder="OKOH WISDOM / WIKIS TECH" />
            <Field label="Headline Line 1" name="line1" defaultValue={h.headline_line_1} placeholder="Okoh Wisdom" required />
            <Field label="Headline Line 2" name="line2" defaultValue={h.headline_line_2} placeholder="Uchechukwu" />

            {/* Portrait Image URL with preview */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-white/60">
                Portrait / Hero Image Path or URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  name="heroMediaUrl"
                  type="text"
                  defaultValue={h.hero_media_url || "/wikis.png"}
                  placeholder="/wikis.png"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
                />
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.hero_media_url || "/wikis.png"}
                    alt="Hero Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <span className="block text-[11px] text-white/40">
                Default: <code className="text-[#6f8cff]">/wikis.png</code>. Can be a local path or Supabase Storage URL.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-2">
                Supporting Bio Paragraph
              </label>
              <textarea
                name="supporting"
                defaultValue={h.supporting_text ?? ""}
                rows={3}
                placeholder="I build websites & digital products that MOVE..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white outline-none focus:border-[#6f8cff] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Rotating Words (one per line)
              </label>
              <textarea
                name="rotatingWords"
                defaultValue={words}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white outline-none focus:border-[#6f8cff]"
              />
              <span className="mt-1 block text-[11px] text-white/40">
                These words animate in italic serif font in the hero section.
              </span>
            </div>

            <div className="space-y-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <Field
                label="Rotation Interval (ms)"
                name="interval"
                type="number"
                defaultValue={String(h.rotation_interval_ms ?? 2200)}
              />
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  name="rotationEnabled"
                  type="checkbox"
                  defaultChecked={h.rotation_enabled ?? true}
                  className="rounded border-white/20"
                />
                <span>Enable Word Rotation Animation</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  name="availabilityEnabled"
                  type="checkbox"
                  defaultChecked={h.availability_enabled ?? true}
                  className="rounded border-white/20"
                />
                <span>Show Availability Status Indicator</span>
              </label>
            </div>

            <Field
              label="Availability Status Message"
              name="availabilityMessage"
              defaultValue={h.availability_message ?? "Available for select freelance contracts & advisory."}
            />

            <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
              <Field
                label="Primary CTA Label"
                name="primaryLabel"
                defaultValue={h.primary_cta_label ?? "View My Work"}
              />
              <Field
                label="Primary CTA URL"
                name="primaryUrl"
                defaultValue={h.primary_cta_url ?? "/work"}
              />
              <Field
                label="Secondary CTA Label"
                name="secondaryLabel"
                defaultValue={h.secondary_cta_label ?? "Let's Talk"}
              />
              <Field
                label="Secondary CTA URL"
                name="secondaryUrl"
                defaultValue={h.secondary_cta_url ?? "/contact"}
              />
            </div>
          </div>
        </section>

        {/* Homepage Sections Ordering */}
        {sections && sections.length > 0 && (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-semibold text-white">Homepage Sections Ordering &amp; Visibility</h2>
            <p className="text-xs text-white/40">
              Toggle visibility or change order numbers (lower numbers appear higher on the page).
            </p>

            <div className="space-y-2 pt-2">
              {sections.map((x) => (
                <div
                  key={x.id}
                  className="grid grid-cols-[1fr_110px_90px] items-center gap-4 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                >
                  <input type="hidden" name="sectionId" value={x.id} />
                  <div>
                    <p className="text-xs font-semibold text-white">{x.title}</p>
                    <p className="font-mono text-[10px] text-white/40">{x.section_key}</p>
                  </div>
                  <input
                    name={`order:${x.id}`}
                    type="number"
                    defaultValue={x.sort_order}
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-[#6f8cff]"
                  />
                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <input
                      name={`enabled:${x.id}`}
                      type="checkbox"
                      defaultChecked={x.enabled}
                      className="rounded border-white/20"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 shadow-lg"
          >
            Publish Homepage Changes
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/60">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
      />
    </div>
  );
}