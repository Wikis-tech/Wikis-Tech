import { createClient } from "@/lib/supabase/server";
import {
  createTestimonial,
  updateTestimonial,
  moveTestimonialToTrash,
} from "./actions";
import {
  Quote,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  User,
  Building,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminTestimonialsPage({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const s = await createClient();

  const { data: testimonials } = await s
    .from("testimonials")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const items = testimonials ?? [];
  const visibleCount = items.filter((x) => x.visibility).length;
  const featuredCount = items.filter((x) => x.featured).length;

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
            LEADS &amp; CLIENTS / TESTIMONIALS
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            Client Endorsements &amp; Reviews
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage genuine client reviews, recommendations, and quotes shown across your homepage carousel (up to 20 endorsements).
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-white/40">
          <span>{items.length} total</span>
          <span>·</span>
          <span className="text-emerald-400">{visibleCount} live on homepage</span>
          <span>·</span>
          <span className="text-[#6f8cff]">{featuredCount} featured</span>
        </div>
      </div>

      {/* Storage Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#6f8cff]/20 bg-[#6f8cff]/5 p-4 text-xs text-white/70">
        <Sparkles className="h-4 w-4 shrink-0 text-[#6f8cff] mt-0.5" />
        <div>
          <p className="font-semibold text-white">Direct Image URL Support Enabled</p>
          <p className="mt-0.5 text-white/50 leading-relaxed">
            You can paste direct image URLs (from Unsplash, LinkedIn, GitHub, Imgur, Cloudinary) into the Photo URL field to display client avatars without using up your Supabase Storage quota.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold text-emerald-300">Testimonials updated in Supabase successfully!</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="font-semibold text-rose-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Add New Testimonial Form */}
      <section className="rounded-2xl border border-[#6f8cff]/20 bg-[linear-gradient(145deg,rgba(111,140,255,0.04),rgba(255,255,255,0.01))] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6f8cff]/20 text-[#6f8cff]">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Testimonial</h2>
            <p className="text-xs text-white/40">Store a client endorsement directly in your database.</p>
          </div>
        </div>

        <form action={createTestimonial} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Client / Reviewer Name <span className="text-rose-400">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Adebayo Ogunlesi"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Role / Title
              </label>
              <input
                name="position"
                placeholder="e.g. Chief Product Officer"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Company / Organization
              </label>
              <input
                name="company"
                placeholder="e.g. PayFlow Capital"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Photo URL / Avatar (External URL or Storage)
              </label>
              <input
                name="photoUrl"
                type="text"
                placeholder="https://... (preserves Supabase storage)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white outline-none focus:border-[#6f8cff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Client Quote / Endorsement <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="quote"
              required
              rows={4}
              placeholder="&ldquo;Wisdom delivered our web platform ahead of schedule with remarkable attention to detail...&rdquo;"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white outline-none focus:border-[#6f8cff] leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-5 text-xs text-white/70">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="visibility"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-white/20"
                />
                <span>Visible on Portfolio</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="featured"
                  type="checkbox"
                  className="rounded border-white/20"
                />
                <span>Featured Testimonial</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-white/40">Sort Order:</span>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={items.length * 10 + 10}
                  className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Testimonial</span>
            </button>
          </div>
        </form>
      </section>

      {/* Existing Testimonials List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Existing Testimonials ({items.length})</h2>
          <span className="font-mono text-xs text-white/40">Supabase: testimonials table</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] p-10 text-center">
            <Quote className="h-8 w-8 text-white/20 mx-auto" />
            <p className="mt-3 text-sm text-white/60">No testimonials published yet.</p>
            <p className="mt-1 text-xs text-white/40">Use the form above to add your first client endorsement.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition hover:border-white/15"
              >
                <form action={updateTestimonial} className="space-y-4">
                  <input type="hidden" name="id" value={t.id} />

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-[#6f8cff] overflow-hidden">
                        {t.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.photo_url}
                            alt={t.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            name="name"
                            defaultValue={t.name}
                            className="font-semibold text-sm text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#6f8cff] outline-none"
                          />
                          {t.featured && (
                            <span className="rounded bg-[#6f8cff]/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#6f8cff]">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <input
                            name="position"
                            defaultValue={t.position ?? ""}
                            placeholder="Role"
                            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#6f8cff] outline-none"
                          />
                          <span>·</span>
                          <input
                            name="company"
                            defaultValue={t.company ?? ""}
                            placeholder="Company"
                            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#6f8cff] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Direct Photo URL Input with live preview */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-white/50">
                      Avatar / Photo URL (External link or local path)
                    </label>
                    <input
                      name="photoUrl"
                      type="text"
                      defaultValue={t.photo_url ?? ""}
                      placeholder="https://... (preserves Supabase storage)"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white/90 outline-none focus:border-[#6f8cff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/50 mb-1">
                      Client Quote / Endorsement
                    </label>
                    <textarea
                      name="quote"
                      defaultValue={t.quote}
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/80 leading-relaxed outline-none focus:border-[#6f8cff]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.05] text-xs text-white/50">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          name="visibility"
                          type="checkbox"
                          defaultChecked={t.visibility}
                          className="rounded border-white/20"
                        />
                        <span>Live on site</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          name="featured"
                          type="checkbox"
                          defaultChecked={t.featured}
                          className="rounded border-white/20"
                        />
                        <span>Featured</span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <span>Order:</span>
                        <input
                          name="sortOrder"
                          type="number"
                          defaultValue={t.sort_order}
                          className="w-14 rounded border border-white/10 bg-black/30 px-2 py-0.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-white/30">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </form>

                {/* Move to Trash Form */}
                <form action={moveTestimonialToTrash} className="mt-2 flex justify-end">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-[11px] text-rose-400/60 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Move to Trash</span>
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
