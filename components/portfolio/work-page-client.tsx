"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight, GitBranch, Code2, Sparkles, Filter } from "lucide-react";
import type { VerifiedBuild } from "@/lib/site/verified-builds";

export type CategoryLink = { project_categories?: { name?: string; slug?: string } | null };
export type Snap = {
  problem?: string;
  solution?: string;
  outcome?: string;
  live_url?: string | null;
  github_url?: string | null;
  card_media_url?: string | null;
  categories?: CategoryLink[];
};

export type ProjectItem = {
  project_id: string;
  slug: string;
  title: string;
  short_description: string | null;
  status: string;
  confidential: boolean;
  snapshot: unknown;
  published_at?: string | null;
};

export type DesignItem = {
  id: string;
  title: string;
  client: string;
  year?: string | number | null;
  description?: string | null;
  image_url: string;
  tags?: string[] | null;
  design_categories?: { name?: string } | null;
};

type Props = {
  projects: ProjectItem[];
  verifiedBuilds: VerifiedBuild[];
  designs?: DesignItem[] | null;
};

export function WorkPageClient({ projects, verifiedBuilds, designs = [] }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Work" },
    { id: "software", label: "Web & Software" },
    { id: "product", label: "Digital Products" },
    { id: "strategy", label: "Research & Strategy" },
  ];

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    const snap = (p.snapshot ?? {}) as Snap;
    const catSlugs = (snap.categories ?? [])
      .map((c) => c.project_categories?.slug?.toLowerCase())
      .filter((s): s is string => Boolean(s));

    if (filter === "software") {
      return (
        catSlugs.includes("software") ||
        catSlugs.includes("web") ||
        catSlugs.includes("development") ||
        catSlugs.some((s) => s.includes("code"))
      );
    }
    if (filter === "product") {
      return (
        catSlugs.includes("product") ||
        catSlugs.includes("ui-ux") ||
        catSlugs.includes("app") ||
        catSlugs.includes("platform")
      );
    }
    if (filter === "strategy") {
      return (
        catSlugs.includes("strategy") ||
        catSlugs.includes("business-research") ||
        catSlugs.includes("presentation") ||
        catSlugs.includes("branding")
      );
    }
    return true;
  });

  return (
    <div className="space-y-20 pb-20">
      {/* Category Filter Controls */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-40px))]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-white/40">
            <Filter className="h-3.5 w-3.5 text-[#6f8cff]" />
            <span>Filter Case Studies</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-white/10 bg-white/[.025] backdrop-blur-md">
            {categories.map((cat) => {
              const active = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilter(cat.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-white text-black font-semibold shadow-sm shadow-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/[.04]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Case Studies Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((p, i) => {
              const snap = (p.snapshot ?? {}) as Snap;
              const hasLive = Boolean(snap.live_url);
              const previewLink = snap.live_url || `/work/${p.slug}`;
              const formattedStatus = p.status.replaceAll("_", " ");

              return (
                <article
                  key={p.project_id}
                  data-reveal="up"
                  data-delay={Math.min(i * 60, 300)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[.08] bg-[#070b14]/70 transition-all duration-300 hover:border-[#6f8cff]/35 hover:bg-[#09101f]/80 hover:shadow-2xl hover:shadow-[#0c1a40]/30"
                >
                  {/* Media Visual Area */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/[.08] bg-[#091124]">
                    {snap.card_media_url ? (
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url("${snap.card_media_url}")` }}
                      />
                    ) : (
                      <div className="relative h-full w-full flex items-center justify-center p-6 bg-radial from-[#152e69]/40 via-[#070b14] to-[#050812]">
                        <div className="text-center">
                          <Code2 className="mx-auto h-8 w-8 text-[#6f8cff]/50 mb-2" />
                          <p className="text-xs font-mono uppercase tracking-[0.16em] text-white/35">
                            {p.title}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status & Index Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-white/70 backdrop-blur-md">
                        {String(i + 1).padStart(2, "0")} · {formattedStatus}
                      </span>
                    </div>

                    {hasLive ? (
                      <a
                        href={snap.live_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md transition hover:bg-white hover:text-black"
                      >
                        <span>Live</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <Link href={`/work/${p.slug}`} className="group/title block">
                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-white transition duration-200 group-hover/title:text-[#8fa1ff]">
                          {p.title}
                        </h3>
                      </Link>

                      <p className="mt-3 text-sm leading-6 text-white/50">
                        {snap.problem || p.short_description}
                      </p>

                      {snap.outcome ? (
                        <div className="mt-4 rounded-xl border border-[#6f8cff]/15 bg-[#174fc4]/10 p-3">
                          <p className="text-xs text-white/40 font-mono uppercase tracking-wider">
                            Outcome & Impact
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#b0c0ff]">
                            {snap.outcome}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Links */}
                    <div className="mt-6 flex items-center justify-between border-t border-white/[.06] pt-4 text-xs font-medium">
                      <Link
                        href={`/work/${p.slug}`}
                        className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-white"
                      >
                        <span>Explore Case Study</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#6f8cff]" />
                      </Link>

                      {hasLive ? (
                        <a
                          href={snap.live_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#6f8cff] transition hover:text-white"
                        >
                          <span>Visit Production</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center text-sm text-white/40">
              No case studies matching this category yet.
            </div>
          )}
        </div>
      </section>

      {/* Supporting Web Builds & Prototypes */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-40px))] border-t border-white/[.08] pt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff]">
              SUPPORTING PROJECTS & REPOSITORIES
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Verified Web Builds & Frontend Concepts
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-white/45">
            Targeted standalone builds, client landing pages, and frontend studies developed with clean code.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {verifiedBuilds.map((item, i) => (
            <article
              key={item.slug}
              data-reveal="up"
              data-delay={Math.min(i * 45, 250)}
              className="flex flex-col justify-between rounded-xl border border-white/[.08] bg-white/[.02] p-5 transition duration-200 hover:border-white/20 hover:bg-white/[.035]"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/35">
                  <span className="text-[#6f8cff] font-semibold">{item.kind}</span>
                  <span>0{i + 1}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-white/[.06] bg-white/[.03] px-2 py-0.5 text-[10px] font-mono text-white/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-white/[.06] pt-3 text-xs">
                <a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#6f8cff] transition hover:text-white"
                >
                  <span>Live Site</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-white/45 transition hover:text-white"
                >
                  <GitBranch className="h-3 w-3" />
                  <span>GitHub</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Visual Design Archive Teaser */}
      {designs && designs.length > 0 ? (
        <section className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-40px))] border-t border-white/[.08] pt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff]">
                COMMUNICATION & DESIGN
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Visual Artifacts & Brand Systems
              </h2>
            </div>
            <Link
              href="/archive"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#6f8cff] transition hover:text-white"
            >
              <span>Explore Complete Visual Archive</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {designs.slice(0, 6).map((d) => (
              <Link
                key={d.id}
                href="/archive"
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[.08] bg-[#081024] transition duration-200 hover:border-[#6f8cff]/50"
              >
                <div
                  className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${d.image_url}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="text-[10px] font-mono text-[#8fa1ff] truncate">{d.client}</p>
                  <p className="text-xs font-semibold text-white truncate">{d.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
