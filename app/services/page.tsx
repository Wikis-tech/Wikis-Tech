import Link from "next/link";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";
import { getPageMetadata } from "@/lib/site/seo";
import { fallbackServices } from "@/lib/site/fallback-content";
import {
  Code2,
  Layers,
  Sparkles,
  ArrowUpRight,
  Check,
  Cpu,
  Palette,
  BarChart3,
  Clock,
  ShieldCheck,
  Workflow,
  HelpCircle,
  MessagesSquare,
} from "lucide-react";

export async function generateMetadata() {
  return getPageMetadata("services", {
    title: "Services & Engineering — Okoh Wisdom",
    description:
      "Full-stack software engineering, digital product development, UI systems, and AI workflows built for real business utility.",
    path: "/services",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to assign a clean icon if service has no custom icon
function getServiceIcon(slug: string, title: string) {
  const s = (slug + " " + title).toLowerCase();
  if (s.includes("web") || s.includes("software")) return Code2;
  if (s.includes("product") || s.includes("system")) return Layers;
  if (s.includes("design") || s.includes("ui") || s.includes("graphic")) return Palette;
  if (s.includes("ai") || s.includes("automation") || s.includes("prompt")) return Cpu;
  if (s.includes("data") || s.includes("research") || s.includes("business")) return BarChart3;
  return Sparkles;
}

// Deliverable badges for fallback/enhanced cards
const defaultDeliverables: Record<string, string[]> = {
  "web-development": [
    "Full-Stack Next.js / React / Node.js architecture",
    "Clean, typed database schemas (PostgreSQL / Supabase)",
    "Responsive, accessible, pixel-exact layouts",
    "Performance optimization (95+ Lighthouse scores)",
  ],
  "digital-product-development": [
    "End-to-end product architecture & user flows",
    "Authentication, RBAC & payment gateway setup",
    "Interactive prototypes & design system tokens",
    "Staging environments & CI/CD deployment",
  ],
  "graphic-design": [
    "High-impact visual identity & brand guidelines",
    "Marketing collaterals, social & campaign decks",
    "Consistent typography & design token systems",
    "Production-ready vector assets (SVG, PDF, PNG)",
  ],
  "ui-ux-design": [
    "Wireframing & interactive high-fidelity Figma prototypes",
    "Design systems with reusable component libraries",
    "Usability testing, heuristic audits & micro-interactions",
    "Developer-ready handoff specs and documentation",
  ],
  "ai-automation": [
    "Custom prompt pipelines & structured output frameworks (CRAFT)",
    "LLM API integration & automated backend jobs",
    "Internal workflow automation tools & webhooks",
    "Cost-effective token usage & latency optimization",
  ],
  "business-research-data": [
    "Competitive landscape & market intelligence reports",
    "User prospecting, data structuring & pipeline setup",
    "Interactive dashboards & data visualization",
    "Actionable strategic roadmaps for technical execution",
  ],
};

const processSteps = [
  {
    step: "01",
    title: "Discovery & Architecture",
    description:
      "We dissect the problem, clarify core functional requirements, and establish the system architecture, tech stack, and milestone roadmap before writing code.",
    icon: Workflow,
  },
  {
    step: "02",
    title: "Interface & System Design",
    description:
      "Translating product logic into intuitive user interfaces, clean navigation hierarchies, responsive breakpoints, and reusable design components.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Sprint Engineering & Integration",
    description:
      "Rapid, disciplined development sprints with type safety, robust API integration, automated testing, and transparent staging previews.",
    icon: Code2,
  },
  {
    step: "04",
    title: "Deployment, QA & Handover",
    description:
      "Rigorous cross-device testing, SEO & security audits, zero-downtime deployment, and complete documentation with full code ownership.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    q: "How fast can we kick off a project?",
    a: "Most sprints can begin within 3 to 5 business days after scoping and initial agreement. Fast-track landing pages and prototypes can often be delivered in under a week.",
  },
  {
    q: "Can you jump into an existing codebase?",
    a: "Yes. I frequently audit, refactor, and extend existing React, Next.js, TypeScript, and PHP/Node codebases, prioritizing zero regression and clean technical hygiene.",
  },
  {
    q: "What does the code handover look like?",
    a: "You get 100% intellectual property ownership, a clean GitHub repository, environment setup guides, database migration scripts, and architecture walkthroughs.",
  },
  {
    q: "Do you offer post-launch maintenance?",
    a: "Yes. Every project includes a 14 to 30-day post-launch warranty for bug fixes. Retainer packages are also available for ongoing iterations and feature expansion.",
  },
];

export default async function ServicesPage() {
  const s = await createClient();
  const { data: items } = await s
    .from("services")
    .select(
      "id,title,slug,short_description,full_description,icon,featured_image_url,starting_price,currency,cta_label,cta_url,featured,service_pricing_links(pricing_package_id,pricing_packages(package_name,starting_price,currency,custom_quote,visibility))"
    )
    .eq("enabled", true)
    .is("deleted_at", null)
    .order("sort_order");

  const safeItems = items?.length ? items : fallbackServices;

  return (
    <main className="public-page min-h-screen bg-[#050812] text-white">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative mx-auto w-[min(1280px,calc(100%-32px))] pt-16 pb-12 sm:w-[min(1280px,calc(100%-48px))] sm:pt-20 sm:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6f8cff] animate-pulse" />
            <span className="font-mono uppercase tracking-[0.16em] text-[#6f8cff]">
              Services & Capabilities
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
            Engineering digital solutions with intent, speed, and precision.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
            I partner directly with founders, businesses, and engineering teams to turn complex
            requirements into robust software, intuitive products, and automated workflows.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#050812] transition hover:bg-white/90"
            >
              Start a Conversation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              Explore Pricing & Packages
            </Link>
          </div>
        </div>

        {/* Engineering Value Strip */}
        <div className="mt-12 grid grid-cols-2 gap-3 border-y border-white/[0.08] py-6 sm:grid-cols-4 sm:gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40">Core Stack</p>
            <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base">TypeScript & Next.js</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40">Database</p>
            <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base">PostgreSQL / Supabase</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40">Delivery</p>
            <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base">Agile 1–2 Wk Sprints</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40">Ownership</p>
            <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base">100% IP & Clean Code</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] pb-20 sm:w-[min(1280px,calc(100%-48px))]">
        <div className="flex items-center justify-between pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6f8cff]">
            Available Capabilities ({safeItems.length})
          </p>
          <span className="text-xs text-white/40">Direct engagement · No middlemen</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeItems.map((x, i) => {
            const IconComponent = getServiceIcon(x.slug || "", x.title || "");
            const deliverables =
              defaultDeliverables[x.slug || ""] || [
                "Tailored technical architecture",
                "Clean, maintainable source code",
                "Full responsive testing across devices",
                "Direct communication & staging access",
              ];

            return (
              <article
                key={x.id}
                data-reveal="up"
                data-delay={Math.min(i * 60, 300)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 sm:p-7 ${
                  x.featured
                    ? "border-[#6f8cff]/35 bg-[linear-gradient(160deg,rgba(111,140,255,0.06),rgba(5,8,18,0.92))] shadow-lg shadow-[#6f8cff]/5 hover:border-[#6f8cff]/60"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035]"
                }`}
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#6f8cff]">
                        {x.icon ? (
                          <span className="text-lg">{x.icon}</span>
                        ) : (
                          <IconComponent className="h-5 w-5" />
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-white/40">
                        {String(i + 1).padStart(2, "0")} {"//"}
                      </span>
                    </div>

                    {x.featured && (
                      <span className="rounded-full border border-[#6f8cff]/40 bg-[#6f8cff]/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#6f8cff]">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white group-hover:text-[#6f8cff] transition-colors sm:text-2xl">
                    {x.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {x.full_description || x.short_description}
                  </p>

                  {/* Key Deliverables */}
                  <div className="mt-6 pt-5 border-t border-white/[0.06]">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-3">
                      Key Deliverables
                    </p>
                    <ul className="space-y-2">
                      {deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-white/70">
                          <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#6f8cff]" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom row: Pricing & Action */}
                <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    {x.starting_price != null ? (
                      <div>
                        <span className="block font-mono text-[11px] text-white/40">From</span>
                        <span className="font-mono text-sm font-semibold text-white">
                          {x.currency === "NGN" ? "₦" : (x.currency || "$") + " "}
                          {Number(x.starting_price).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="block font-mono text-[11px] text-white/40">Scope</span>
                        <span className="text-xs font-medium text-white/70">Custom Quote</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={x.cta_url || `/contact?service=${x.slug || ""}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/90 transition hover:border-[#6f8cff]/50 hover:bg-[#6f8cff]/10 hover:text-white"
                  >
                    <span>{x.cta_label || "Get in Touch"}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#6f8cff]" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Engineering Process Section */}
      <section className="border-t border-white/[0.08] bg-[#06070b]/60 py-16 sm:py-20">
        <div className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-48px))]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6f8cff]">
              Methodology
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              How we take an idea from napkin sketch to production.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">
              A disciplined, transparent delivery framework designed to eliminate guesswork, keep
              milestones on schedule, and guarantee engineering quality.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((p) => {
              const StepIcon = p.icon;
              return (
                <div
                  key={p.step}
                  className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold tracking-tight text-[#6f8cff]">
                      {p.step}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60">
                      <StepIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ & Assurance Section */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-48px))] sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6f8cff]">
              Transparency
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Frequently asked questions about working together.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Clear expectations build reliable software. Here are the common questions clients and
              collaborators ask before kicking off.
            </p>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 text-white">
                <MessagesSquare className="h-5 w-5 text-[#6f8cff]" />
                <span className="text-sm font-semibold">Have a custom requirement?</span>
              </div>
              <p className="mt-2 text-xs text-white/50 leading-relaxed">
                Need a fractional tech lead, a legacy system migration, or an urgent audit? Let’s
                discuss your specific constraints.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f8cff] hover:text-white transition-colors"
              >
                Schedule a consultation
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition hover:border-white/15"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#6f8cff]" />
                  <div>
                    <h3 className="text-sm font-semibold text-white sm:text-base">{f.q}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] pb-20 sm:w-[min(1280px,calc(100%-48px))]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(111,140,255,0.08),rgba(5,8,18,0.95))] p-8 sm:p-12 text-center sm:text-left">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#6f8cff]">
              Ready to ship?
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Let&apos;s build something durable and valuable.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
              Send over your brief, wireframe, or raw notes. You&apos;ll get an honest assessment,
              architecture plan, and transparent timeline.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#050812] transition hover:bg-white/90"
            >
              Start a Conversation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Request a Formal Quote
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
