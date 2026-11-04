import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "../actions";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const input =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6f8cff]";

export default async function NewProjectPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const s = await createClient();
  const { data: c } = await s
    .from("project_categories")
    .select("id,name")
    .eq("is_visible", true)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin-wikis/projects"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">New Website or App</h1>
        <p className="mt-1 text-sm text-white/50">Add a new software build, client project, or digital product to your portfolio.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Could Not Create Project</p>
            <p className="mt-0.5 text-white/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form action={createProject} className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Project Title <span className="text-rose-400">*</span>
              </label>
              <input
                name="title"
                required
                placeholder="e.g. CampusLink Mobile"
                className={input}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                name="slug"
                required
                placeholder="e.g. campuslink-mobile"
                className={input}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1.5">Short Description</label>
              <textarea
                name="shortDescription"
                rows={3}
                placeholder="Brief summary of what this product accomplishes..."
                className={input}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Year</label>
              <input name="year" type="number" defaultValue={2026} className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Client / Organization</label>
              <input name="client" placeholder="Client Name or Personal Project" className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Your Role</label>
              <input name="role" placeholder="Full-Stack Engineer, Product Designer" className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Status</label>
              <select name="status" defaultValue="live" className={`${input} bg-[#0b0e14]`}>
                {["live", "shipped", "in_development", "prototype", "experiment", "concept", "archived"].map((o) => (
                  <option key={o} value={o}>
                    {o.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Visibility</label>
              <select name="visibility" defaultValue="public" className={`${input} bg-[#0b0e14]`}>
                <option value="public">Public — visible after publishing</option>
                <option value="private">Private — draft only, hidden publicly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Live URL</label>
              <input name="liveUrl" placeholder="https://..." className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">GitHub Repository</label>
              <input name="githubUrl" placeholder="https://github.com/..." className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Card Preview Image URL (Direct external link)
              </label>
              <input name="cardMediaUrl" placeholder="https://... (preserves Supabase storage)" className={input} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Hero Banner Image URL (Direct external link)
              </label>
              <input name="heroMediaUrl" placeholder="https://... (preserves Supabase storage)" className={input} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-white/80 cursor-pointer">
              <input name="featured" type="checkbox" className="rounded border-white/20" />
              <span>Pin on Homepage (Featured Work)</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-white/80 cursor-pointer">
              <input name="confidential" type="checkbox" className="rounded border-white/20" />
              <span>Confidential / Under NDA</span>
            </label>
          </div>
        </section>

        {c && c.length > 0 && (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-white">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {c.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.04] cursor-pointer"
                >
                  <input name="categories" value={cat.id} type="checkbox" className="rounded border-white/20" />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 shadow-lg"
          >
            Create Project &amp; Edit Details →
          </button>
        </div>
      </form>
    </main>
  );
}