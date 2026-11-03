"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Beaker, Terminal, Sparkles, Filter, Code2, Layers } from "lucide-react";

export type ExperimentItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  technology?: string[] | null;
  image_url?: string | null;
  featured?: boolean;
  experiment_date?: string | null;
  demo_url?: string | null;
  github_url?: string | null;
};

export type CraftSettings = {
  enabled: boolean;
  heading: string;
  message: string;
  context_label: string;
  role_label: string;
  action_label: string;
  format_label: string;
  tone_label: string;
  usage_items?: string[] | null;
};

type Props = {
  items: ExperimentItem[];
  craft?: CraftSettings | null;
};

export function LabPageClient({ items, craft }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Experiments" },
    { id: "prototype", label: "Prototypes" },
    { id: "research", label: "Research & AI" },
    { id: "experiment", label: "Interactive Studies" },
  ];

  const filteredItems = items.filter((x) => {
    if (filter === "all") return true;
    const status = (x.status || "").toLowerCase();
    const tech = (x.technology || []).map((t) => t.toLowerCase());

    if (filter === "prototype") {
      return status.includes("prototype") || status.includes("active");
    }
    if (filter === "research") {
      return (
        status.includes("research") ||
        tech.some((t) => t.includes("ai") || t.includes("prompt"))
      );
    }
    if (filter === "experiment") {
      return (
        status.includes("experiment") ||
        tech.some((t) => t.includes("css") || t.includes("motion") || t.includes("ui"))
      );
    }
    return true;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Category Filter Controls */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-40px))]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-white/40">
            <Filter className="h-3.5 w-3.5 text-[#6f8cff]" />
            <span>Filter Lab Experiments</span>
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

        {/* Experiments Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, i) => {
              const formattedStatus = item.status.replaceAll("_", " ");
              const dateYear = item.experiment_date ? item.experiment_date.slice(0, 4) : null;

              return (
                <article
                  key={item.id}
                  data-reveal="up"
                  data-delay={Math.min(i * 50, 250)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[.08] bg-[#070b14]/70 transition-all duration-300 hover:border-[#6f8cff]/35 hover:bg-[#09101f]/80 hover:shadow-xl"
                >
                  {item.image_url ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/[.08] bg-[#091124]">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                        style={{ backgroundImage: `url("${item.image_url}")` }}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/7] w-full border-b border-white/[.08] bg-gradient-to-br from-[#0c1630] to-[#070b14] flex items-center justify-center p-4">
                      <Terminal className="h-6 w-6 text-[#6f8cff]/40" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-white/40">
                        <span className="text-[#6f8cff] uppercase font-semibold">
                          {formattedStatus}
                        </span>
                        {dateYear ? <span>{dateYear}</span> : null}
                      </div>

                      <Link href={`/lab/${item.slug}`} className="mt-3 block group/title">
                        <h3 className="text-xl font-semibold tracking-tight text-white transition group-hover/title:text-[#8fa1ff]">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-white/50">
                        {item.description}
                      </p>

                      {item.technology && item.technology.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.technology.map((tech) => (
                            <span
                              key={tech}
                              className="rounded border border-white/[.06] bg-white/[.03] px-2 py-0.5 text-[10px] font-mono text-white/50"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 border-t border-white/[.06] pt-4 flex items-center justify-between text-xs font-medium">
                      <Link
                        href={`/lab/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-white"
                      >
                        <span>View Lab Entry</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#6f8cff]" />
                      </Link>

                      {item.demo_url ? (
                        <a
                          href={item.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6f8cff] hover:text-white transition"
                        >
                          Demo ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center text-sm text-white/40">
              No lab experiments matching this category.
            </div>
          )}
        </div>
      </section>

      {/* CRAFT Prompt Framework Architecture */}
      {craft?.enabled ? (
        <section className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-40px))] border-t border-white/[.08] pt-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#6f8cff]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Prompt Engineering Model</span>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {craft.heading} Framework
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/50">
                {craft.message}
              </p>
              <div className="mt-6">
                <p className="text-xs font-mono uppercase tracking-wider text-white/35">
                  Applied Daily In
                </p>
                <p className="mt-1 text-xs text-[#8fa1ff]">
                  {(craft.usage_items ?? []).join(" · ")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { letter: "C", name: "Context", desc: craft.context_label || "Background & Boundary" },
                { letter: "R", name: "Role", desc: craft.role_label || "Persona & Identity" },
                { letter: "A", name: "Action", desc: craft.action_label || "Exact Task & Steps" },
                { letter: "F", name: "Format", desc: craft.format_label || "Structure & Schema" },
                { letter: "T", name: "Tone", desc: craft.tone_label || "Rules & Limits" },
              ].map((step) => (
                <div
                  key={step.letter}
                  className="rounded-xl border border-white/[.08] bg-white/[.02] p-4 text-center transition duration-200 hover:border-white/20"
                >
                  <span className="text-2xl font-bold font-mono text-[#6f8cff]">
                    {step.letter}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-white">{step.name}</p>
                  <p className="mt-1 text-[11px] leading-snug text-white/40">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
