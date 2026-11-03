import Link from "next/link";
import { ArrowUpRight, Download, MapPin, CheckCircle2, Code2, Layers, Cpu, Compass, GraduationCap, Briefcase } from "lucide-react";
import { getPageMetadata } from "@/lib/site/seo";
import { fallbackExperience, fallbackSkills } from "@/lib/site/fallback-content";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";

export async function generateMetadata() {
  return getPageMetadata("about", {
    title: "About — Okoh Wisdom",
    description: "Learn about Okoh Wisdom, Wikis Tech, and the mix of software, design, AI and strategy behind the work.",
    path: "/about",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const s = await createClient();
  const [{ data: a }, { data: journey }, { data: education }, { data: experience }, { data: skills }, { data: tech }] =
    await Promise.all([
      s.from("about_profile").select("*").eq("singleton_key", "default").single(),
      s.from("journey_items").select("*").eq("is_visible", true).order("sort_order"),
      s.from("education").select("*").eq("is_visible", true).order("sort_order"),
      s.from("experiences").select("*").eq("is_visible", true).order("sort_order"),
      s.from("skills").select("*").eq("is_visible", true).order("group_name").order("sort_order"),
      s.from("technologies").select("*").eq("is_visible", true).order("category").order("sort_order"),
    ]);

  const safeExperience = experience?.length ? experience : fallbackExperience;
  const safeSkills = skills?.length ? skills : fallbackSkills;
  const skillGroups = ["Build", "Design", "Think", "AI"];
  const techCategories = ["Frontend", "Backend/Data", "Infrastructure", "Creative", "Business", "AI"];

  const portraitUrl = a?.portrait_url || "/wikis.png";

  return (
    <main className="public-page min-h-screen bg-[#050812] text-white">
      <PublicNav />

      {/* Hero Header & Portrait Section */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] pt-16 pb-16 sm:w-[min(1280px,calc(100%-40px))] sm:pt-20 sm:pb-20 border-b border-white/[.08]">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#6f8cff]">
              <Code2 className="h-3.5 w-3.5" />
              <span>About Okoh Wisdom / Wikis Tech</span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.14]">
              {a?.headline ?? "More than one discipline. One way of thinking."}
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/60 max-w-2xl">
              {a?.introduction}
            </p>

            {/* Quick Techie Metadata Details */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-white/50">
              {a?.location ? (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#6f8cff]" />
                  <span>{a.location}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Available for collaborations</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {a?.resume_url ? (
                <a
                  href={a.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Résumé</span>
                </a>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-white/[.08]"
              >
                <span>Let&apos;s Talk</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#6f8cff]" />
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-white/60 transition hover:text-white"
              >
                <span>View Selected Work</span>
              </Link>
            </div>
          </div>

          {/* Portrait Container */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[#091124] shadow-2xl">
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-700 hover:scale-[1.02]"
                style={{ backgroundImage: `url("${portraitUrl}")` }}
                role="img"
                aria-label="Okoh Wisdom portrait"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#6f8cff]">
                  Software Developer · Product Builder
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  Computer Science Undergraduate · Creative Technologist
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Mindset & Pillars */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-40px))] border-b border-white/[.08]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
              ENGINEERING APPROACH
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Solving real problems through code, design, and practical AI.
            </h2>
            {a?.biography ? (
              <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-white/50">
                <p>{a.biography}</p>
              </div>
            ) : null}

            {a?.philosophy ? (
              <div className="mt-8 rounded-xl border border-[#6f8cff]/20 bg-[#174fc4]/[0.08] p-5">
                <p className="text-xs font-mono uppercase tracking-wider text-[#8fa1ff]">
                  Core Philosophy
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/80 italic">
                  &ldquo;{a.philosophy}&rdquo;
                </p>
              </div>
            ) : null}
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-5 transition duration-200 hover:border-white/15">
              <Code2 className="h-5 w-5 text-[#6f8cff]" />
              <h3 className="mt-3 text-base font-semibold text-white">Full-Stack Engineering</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Modern web architectures using Next.js, TypeScript, PostgreSQL, and Supabase. Clean code, scalable components, and resilient APIs.
              </p>
            </div>

            <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-5 transition duration-200 hover:border-white/15">
              <Layers className="h-5 w-5 text-[#6f8cff]" />
              <h3 className="mt-3 text-base font-semibold text-white">Interface & Product Design</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Ergonomic UI engineering focused on hierarchy, accessibility, and micro-interactions that make complex software feel effortless.
              </p>
            </div>

            <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-5 transition duration-200 hover:border-white/15">
              <Cpu className="h-5 w-5 text-[#6f8cff]" />
              <h3 className="mt-3 text-base font-semibold text-white">Applied AI & Automation</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Building practical AI integrations, prompt frameworks (such as CRAFT), and workflow automations that solve real operational bottlenecks.
              </p>
            </div>

            <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-5 transition duration-200 hover:border-white/15">
              <Compass className="h-5 w-5 text-[#6f8cff]" />
              <h3 className="mt-3 text-base font-semibold text-white">Strategy & Discovery</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Grounding every technical decision in business clarity, user research, and measurable outcomes rather than speculative decoration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Career Timeline */}
      {safeExperience.length ? (
        <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-40px))] border-b border-white/[.08]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#6f8cff]">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Work Experience & Roles</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Where I&apos;ve built hands-on experience
          </h2>

          <div className="mt-8 space-y-4">
            {safeExperience.map((exp, i) => (
              <article
                key={exp.id}
                data-reveal="up"
                data-delay={Math.min(i * 50, 250)}
                className="rounded-xl border border-white/[.08] bg-white/[.02] p-6 transition duration-200 hover:border-white/20 hover:bg-white/[.035]"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                    <p className="text-sm text-[#8fa1ff] font-medium">{exp.company}</p>
                  </div>
                  <div className="text-xs font-mono text-white/40">
                    <span>
                      {exp.start_date?.slice(0, 4) ?? ""} —{" "}
                      {exp.current_position ? "Present" : exp.end_date?.slice(0, 4) ?? ""}
                    </span>
                  </div>
                </div>

                {exp.description ? (
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/50 max-w-3xl">
                    {exp.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Capabilities & Tech Stack */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-40px))] border-b border-white/[.08]">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
          SKILLS & CAPABILITIES
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          What I build with across disciplines
        </h2>

        {/* Skill Groups */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => {
            const items = safeSkills.filter((x) => x.group_name === group);
            if (!items.length) return null;
            return (
              <div
                key={group}
                className="rounded-xl border border-white/[.08] bg-white/[.02] p-5"
              >
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6f8cff]">
                  {group}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded border border-white/[.06] bg-white/[.03] px-2.5 py-1 text-xs text-white/60"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technologies Breakdown */}
        {tech?.length ? (
          <div className="mt-8 rounded-xl border border-white/[.08] bg-white/[.02] p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              Technologies & Infrastructure
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {techCategories.map((cat) => {
                const items = tech.filter((x) => x.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-white/70">{cat}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                      {items.map((t) => t.name).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Education & Journey */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-40px))]">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Education */}
          {education?.length ? (
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#6f8cff]">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Academic Foundation</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Education</h2>
              <div className="mt-6 space-y-3">
                {education.map((edu) => (
                  <article
                    key={edu.id}
                    className="rounded-xl border border-white/[.08] bg-white/[.02] p-5"
                  >
                    <h3 className="font-semibold text-white">{edu.institution}</h3>
                    <p className="mt-1 text-xs text-[#8fa1ff]">
                      {[edu.qualification, edu.program].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-2 text-xs font-mono text-white/35">
                      {edu.start_year ?? ""} — {edu.is_current ? "Present" : edu.end_year ?? ""}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {/* Journey Milestones */}
          {journey?.length ? (
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#6f8cff]">
                MILESTONES & SPEAKING
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Journey Highlights</h2>
              <div className="mt-6 space-y-3">
                {journey.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/[.08] bg-white/[.02] p-5"
                  >
                    <p className="text-xs font-mono text-white/35">{item.date_label}</p>
                    <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                    {item.description ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}