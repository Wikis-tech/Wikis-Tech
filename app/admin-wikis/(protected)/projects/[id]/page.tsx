import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addBlock,
  deleteBlock,
  moveProjectToTrash,
  publishProject,
  updateProject,
  uploadProjectMedia,
} from "../actions";
import { CheckCircle2, AlertTriangle, ExternalLink, ArrowLeft, Upload, Trash2, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const input =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6f8cff]";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; published?: string; error?: string; created?: string }>;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectEditor({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved, published, error, created } = await searchParams;

  if (!UUID_REGEX.test(id)) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 pt-10 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6f8cff]/15 text-[#6f8cff] mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">Invalid Project Reference</h1>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            The project identifier <code className="font-mono text-xs text-[#6f8cff]">{id}</code> is not a valid UUID format.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href="/admin-wikis/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
            >
              <span>View All Websites &amp; Apps</span>
            </Link>
            <Link
              href="/admin-wikis"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const s = await createClient();

  const [{ data: p }, { data: c }, { data: l }, { data: blocks }] = await Promise.all([
    s.from("projects").select("*").eq("id", id).is("deleted_at", null).maybeSingle(),
    s.from("project_categories").select("id,name").order("sort_order"),
    s.from("project_category_links").select("category_id").eq("project_id", id),
    s.from("project_blocks").select("*").eq("project_id", id).order("sort_order"),
  ]);

  if (!p) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 pt-10 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6f8cff]/15 text-[#6f8cff] mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">Project Not Found</h1>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            This project was not found in your Supabase database or has been moved to Trash.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href="/admin-wikis/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
            >
              <span>View All Websites &amp; Apps</span>
            </Link>
            <Link
              href="/admin-wikis/trash"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span>Check Trash &amp; Recovery</span>
            </Link>
            <Link
              href="/admin-wikis/projects/new"
              className="inline-flex items-center gap-2 rounded-xl border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-5 py-2.5 text-xs font-medium text-[#6f8cff] transition hover:bg-[#6f8cff]/20"
            >
              <span>+ Add New Project</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selected = new Set((l ?? []).map((x) => x.category_id));
  const mediaIds = [p.card_media_id, p.hero_media_id].filter(Boolean);
  const { data: mediaRows } = mediaIds.length
    ? await s.from("media_library").select("id,storage_bucket,storage_path").in("id", mediaIds)
    : { data: [] };

  const mediaUrl = (mediaId: string | null) => {
    const row = mediaRows?.find((x) => x.id === mediaId);
    return row ? s.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data.publicUrl : null;
  };
  const cardUrl = mediaUrl(p.card_media_id);
  const heroUrl = mediaUrl(p.hero_media_id);

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin-wikis/projects"
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Websites &amp; Projects</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            {p.title || "Untitled Project"}
          </h1>
          <p className="mt-1 font-mono text-xs text-white/40">
            Status: <span className="text-[#6f8cff] uppercase">{p.content_state}</span> ·{" "}
            {p.status?.replaceAll("_", " ")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {p.content_state === "published" && p.visibility === "public" && (
            <Link
              href={`/work/${p.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
            >
              <span>View Public Page</span>
              <ExternalLink className="h-3 w-3 text-[#6f8cff]" />
            </Link>
          )}
          <button
            form="project-editor-form"
            type="submit"
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
          >
            Save Draft
          </button>
          <button
            form="project-editor-form"
            formAction={publishProject}
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-lg"
          >
            Save &amp; Publish
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {published && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Project Published Successfully!</p>
            <p className="mt-0.5 text-white/80">
              Your updates and published snapshots are now live across your portfolio Work index and case studies.
            </p>
          </div>
        </div>
      )}

      {saved && !published && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6f8cff] mt-0.5" />
          <div>
            <p className="font-semibold text-blue-300">Draft Saved to Supabase</p>
            <p className="mt-0.5 text-white/80">
              All project fields and category links have been updated in your database.
            </p>
          </div>
        </div>
      )}

      {created && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Project Created Successfully!</p>
            <p className="mt-0.5 text-white/80">You can now add case study details, media screenshots, and publish when ready.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Action Notice</p>
            <p className="mt-0.5 text-white/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* SECTION 1: Visual Presentation Media (Standalone Forms, NOT nested!) */}
      <section className="rounded-2xl border border-[#6f8cff]/20 bg-[linear-gradient(145deg,rgba(111,140,255,0.05),rgba(255,255,255,0.01))] p-6 space-y-4">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#6f8cff] uppercase">
            VISUAL PRESENTATION
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Project Screenshots &amp; Visuals</h2>
          <p className="mt-1 text-xs text-white/50">
            Upload screenshot assets for Work catalog cards and the case-study hero banner.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 pt-2">
          {/* Card Preview Media */}
          <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 space-y-3">
            <span className="block font-mono text-xs font-semibold text-white/80">
              1. Work Card Preview Image
            </span>
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-dashed border-white/15 bg-[#080d1a] relative">
              {cardUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cardUrl}
                  alt="Card Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center p-4">
                  <p className="text-xs text-white/40">No preview image uploaded yet</p>
                </div>
              )}
            </div>

            <form action={uploadProjectMedia} className="space-y-2">
              <input type="hidden" name="projectId" value={id} />
              <input type="hidden" name="kind" value="card" />
              <input
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                required
                className="block w-full text-xs text-white/50 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-black cursor-pointer"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Card Image</span>
              </button>
            </form>
          </div>

          {/* Hero Banner Media */}
          <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 space-y-3">
            <span className="block font-mono text-xs font-semibold text-white/80">
              2. Case Study Hero Banner
            </span>
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-dashed border-white/15 bg-[#080d1a] relative">
              {heroUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={heroUrl}
                  alt="Hero Banner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center p-4">
                  <p className="text-xs text-white/40">Optional large hero banner</p>
                </div>
              )}
            </div>

            <form action={uploadProjectMedia} className="space-y-2">
              <input type="hidden" name="projectId" value={id} />
              <input type="hidden" name="kind" value="hero" />
              <input
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                required
                className="block w-full text-xs text-white/50 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-black cursor-pointer"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Hero Banner</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 2: Main Project Basics & Case Study Form */}
      <form id="project-editor-form" action={updateProject} className="space-y-8">
        <input type="hidden" name="id" value={id} />

        {/* Basics Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-white">Project Basics</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project Title" name="title" defaultValue={p.title} required />
            <Field label="URL Slug" name="slug" defaultValue={p.slug} required />
            <Field label="Client / Organization" name="client" defaultValue={p.client} placeholder="Personal / Client Name" />
            <Field label="Your Role" name="role" defaultValue={p.role} placeholder="Full-Stack Engineer, Designer" />

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                defaultValue={p.short_description ?? ""}
                rows={2}
                placeholder="A high-performance digital product solving..."
                className={input}
              />
            </div>

            <Field label="Year" name="year" type="number" defaultValue={String(p.year ?? 2026)} />

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Project Status</label>
              <select name="status" defaultValue={p.status} className={`${input} bg-[#0b0e14]`}>
                {["live", "shipped", "in_development", "prototype", "experiment", "concept", "archived"].map((o) => (
                  <option key={o} value={o}>
                    {o.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Visibility</label>
              <select name="visibility" defaultValue={p.visibility} className={`${input} bg-[#0b0e14]`}>
                <option value="public">Public — visible after publish</option>
                <option value="private">Private — draft only, hidden publicly</option>
              </select>
            </div>

            <Field label="Live Website / Product URL" name="liveUrl" defaultValue={p.live_url} placeholder="https://..." />
            <Field label="GitHub Repository URL" name="githubUrl" defaultValue={p.github_url} placeholder="https://github.com/..." />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-white/80 cursor-pointer">
              <input name="featured" type="checkbox" defaultChecked={p.featured} className="rounded border-white/20" />
              <span>Pin on Homepage (Featured Work)</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-white/80 cursor-pointer">
              <input name="confidential" type="checkbox" defaultChecked={p.confidential} className="rounded border-white/20" />
              <span>Confidential / Under NDA</span>
            </label>
          </div>

          {c && c.length > 0 && (
            <div className="pt-2">
              <span className="block text-xs font-medium text-white/60 mb-2">Categories</span>
              <div className="flex flex-wrap gap-2">
                {c.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.04] cursor-pointer"
                  >
                    <input
                      name="categories"
                      value={cat.id}
                      type="checkbox"
                      defaultChecked={selected.has(cat.id)}
                      className="rounded border-white/20"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Case Study Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#6f8cff] uppercase">
              CASE STUDY STORY
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">4 Core Questions</h2>
            <p className="text-xs text-white/50">
              Structured narrative for visitors and prospective clients.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <Case
              label="1. Here is the problem."
              name="problem"
              value={p.problem}
              placeholder="What friction, complexity, or business bottleneck existed before this project?"
            />
            <Case
              label="2. Here is what I built."
              name="solution"
              value={p.solution}
              placeholder="What digital product or architecture did you engineer to solve it?"
            />
            <Case
              label="3. Here is why it mattered."
              name="whyItMattered"
              value={p.why_it_mattered}
              placeholder="Why was this valuable for the user, business, or operational workflow?"
            />
            <Case
              label="4. Here is what changed."
              name="outcome"
              value={p.outcome}
              placeholder="What measurable results, speedups, or outcomes occurred?"
            />
          </div>
        </section>

        {/* SEO / Sharing */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-white">SEO &amp; Sharing Overrides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Custom SEO Title" name="seoTitle" defaultValue={p.seo_title} placeholder={p.title} />
            <Field label="Social Preview Image URL" name="seoImageUrl" defaultValue={p.seo_image_url} placeholder="https://..." />
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1.5">Custom SEO Description</label>
              <textarea
                name="seoDescription"
                defaultValue={p.seo_description ?? ""}
                rows={2}
                placeholder={p.short_description ?? ""}
                className={input}
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input name="seoNoindex" type="checkbox" defaultChecked={p.seo_noindex} className="rounded border-white/20" />
              <span>Exclude this project from search engines (noindex)</span>
            </label>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-medium text-white transition hover:bg-white/10"
          >
            Save Draft Changes
          </button>
          <button
            formAction={publishProject}
            type="submit"
            className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-white/90 shadow-lg"
          >
            Save &amp; Publish Project
          </button>
        </div>
      </form>

      {/* Supporting Story Blocks */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">Additional Story Blocks</h2>
        <div className="space-y-2 pt-2">
          {blocks?.length ? (
            blocks.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/20 p-4"
              >
                <div>
                  <span className="font-mono text-[10px] font-semibold text-[#6f8cff] uppercase">
                    {b.block_type.replaceAll("_", " ")}
                  </span>
                  <p className="mt-1 text-xs text-white/70 whitespace-pre-wrap">
                    {(b.data as { content?: string })?.content || "—"}
                  </p>
                </div>
                <form action={deleteBlock}>
                  <input type="hidden" name="blockId" value={b.id} />
                  <input type="hidden" name="projectId" value={id} />
                  <button type="submit" className="text-xs text-rose-400 hover:text-rose-300 transition">
                    Remove
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40">
              No extra story blocks added yet.
            </p>
          )}
        </div>

        <form action={addBlock} className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
          <input type="hidden" name="projectId" value={id} />
          <select name="blockType" className={`${input} bg-[#0b0e14]`}>
            {["heading", "paragraph", "image", "gallery", "video", "quote", "stats", "two_column", "full_width_image", "technology", "before_after", "embed", "spacer", "cta"].map(
              (o) => (
                <option key={o} value={o}>
                  {o.replaceAll("_", " ").toUpperCase()}
                </option>
              ),
            )}
          </select>
          <textarea name="content" rows={2} placeholder="Block content..." className={input} />
          <button type="submit" className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90">
            Add Block
          </button>
        </form>
      </section>

      {/* Delete / Trash Form */}
      <div className="flex justify-end pt-4 border-t border-white/[0.06]">
        <form action={moveProjectToTrash}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Move Project to Trash</span>
          </button>
        </form>
      </div>
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
  defaultValue?: string | number | null;
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
        defaultValue={defaultValue ? String(defaultValue) : ""}
        placeholder={placeholder}
        required={required}
        className={input}
      />
    </div>
  );
}

function Case({
  label,
  name,
  value,
  placeholder,
}: {
  label: string;
  name: string;
  value?: string | null;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/80">{label}</label>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        rows={3}
        maxLength={5000}
        placeholder={placeholder}
        className={input}
      />
    </div>
  );
}
