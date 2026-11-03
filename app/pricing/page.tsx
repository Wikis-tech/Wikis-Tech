import Link from "next/link";
import { getPageMetadata } from "@/lib/site/seo";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";
import {
  Check,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  HelpCircle,
  Code2,
  FileCode2,
  Layers,
} from "lucide-react";

export async function generateMetadata() {
  return getPageMetadata("pricing", {
    title: "Pricing & Packages — Okoh Wisdom",
    description:
      "Predictable project pricing and starting points for full-stack software, digital products, and technical consulting.",
    path: "/pricing",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PricingPackageItem {
  id: string;
  package_name: string;
  subtitle?: string | null;
  starting_price?: number | string | null;
  currency?: string | null;
  custom_quote?: boolean | null;
  description?: string | null;
  included_features?: string[] | null;
  cta_text?: string | null;
  cta_url?: string | null;
  featured?: boolean | null;
}

const fallbackPricingPackages: PricingPackageItem[] = [
  {
    id: "pkg-1",
    package_name: "Sprint MVP / Landing Experience",
    subtitle: "Fast Launch",
    starting_price: 80000,
    currency: "NGN",
    custom_quote: false,
    description:
      "Built for early-stage founders, product launches, or businesses needing a high-conversion, speed-optimized web presence.",
    included_features: [
      "Responsive Next.js / React application",
      "Tailwind CSS styling & fluid micro-interactions",
      "Lead generation forms & email webhook integration",
      "95+ Google Lighthouse speed & SEO rating",
      "Vercel / Netlify production deployment & SSL",
      "14 days post-launch warranty & bug fixes",
    ],
    cta_text: "Get Started ↗",
    cta_url: "/contact?package=sprint-mvp",
    featured: false,
  },
  {
    id: "pkg-2",
    package_name: "Full-Stack Web Application",
    subtitle: "Most Popular",
    starting_price: 250000,
    currency: "NGN",
    custom_quote: false,
    description:
      "End-to-end database-backed application featuring user authentication, management dashboards, API integrations, and secure data handling.",
    included_features: [
      "PostgreSQL / Supabase relational database & RLS rules",
      "Secure user authentication & role-based permissions (RBAC)",
      "Interactive administrative dashboard & CRUD operations",
      "Payment gateway integration (Paystack / Stripe)",
      "Automated transactional emails & webhooks",
      "CI/CD deployment pipeline & staging previews",
      "30 days post-launch technical engineering support",
    ],
    cta_text: "Build Full-Stack ↗",
    cta_url: "/contact?package=full-stack-app",
    featured: true,
  },
  {
    id: "pkg-3",
    package_name: "Custom Enterprise & AI Workflows",
    subtitle: "Bespoke Scope",
    starting_price: null,
    currency: "NGN",
    custom_quote: true,
    description:
      "Tailored technical architectures, applied AI pipelines (CRAFT framework), legacy codebase modernizations, or fractional CTO advisory.",
    included_features: [
      "Dedicated weekly engineering sprints",
      "Custom LLM pipelines, prompt systems & automations",
      "Complex third-party API & asynchronous webhooks",
      "Full architectural audit, performance & security review",
      "Direct asynchronous communication channel (Slack/Discord)",
      "Comprehensive system documentation & clean team handover",
    ],
    cta_text: "Request Custom Scope ↗",
    cta_url: "/quote",
    featured: false,
  },
];

const pricingFaqs = [
  {
    q: "How are project payments structured?",
    a: "Standard contracts use a 50/50 milestone model: a 50% deposit to initiate scoping and sprint reservations, and the remaining 50% upon successful testing and production deployment.",
  },
  {
    q: "Can I pay in international currencies (USD, GBP, EUR)?",
    a: "Yes. International clients can settle invoices via Stripe, Wise, or direct wire transfer in USD, EUR, or GBP at prevailing exchange rates.",
  },
  {
    q: "What happens if requirements expand during the sprint?",
    a: "We work in agile milestones. Minor tweaks are incorporated without fuss. If major new features are requested, we transparently scope them as a follow-up sprint.",
  },
  {
    q: "Who owns the code and intellectual property?",
    a: "You retain 100% ownership of all source code, design assets, database schemas, and documentation from the day the project is delivered.",
  },
];

export default async function PricingPage() {
  const s = await createClient();
  const [{ data: settings }, { data: items }] = await Promise.all([
    s.from("pricing_settings").select("*").eq("singleton_key", "default").single(),
    s
      .from("pricing_packages")
      .select("*")
      .eq("visibility", true)
      .is("deleted_at", null)
      .order("sort_order"),
  ]);

  if (!settings?.enabled) {
    return (
      <main className="public-page min-h-screen bg-[#06070b] text-white">
        <PublicNav />
        <section className="mx-auto w-[min(900px,calc(100%-32px))] py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-[0.16em] text-[#6f8cff]">
            Pricing
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Let’s talk about your project scope.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/50">
            Public pricing tiers are currently undergoing updates. Tell me what you’re building and
            I’ll provide a tailored, transparent proposal.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#06070b] transition hover:bg-white/90"
            >
              Start a Conversation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        <PublicFooter />
      </main>
    );
  }

  const safePackages: PricingPackageItem[] =
    items && items.length > 0 ? items : fallbackPricingPackages;

  return (
    <main className="public-page min-h-screen bg-[#06070b] text-white">
      <PublicNav />

      {/* Hero Section */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] pt-16 pb-12 sm:w-[min(1280px,calc(100%-48px))] sm:pt-20 sm:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6f8cff] animate-pulse" />
            <span className="font-mono uppercase tracking-[0.16em] text-[#6f8cff]">
              Investment & Scope
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
            {settings.heading || "Predictable pricing for high-impact software."}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
            {settings.description ||
              "Every project is different. These ranges give you clear starting benchmarks for scoping, milestone planning, and transparent collaboration."}
          </p>
        </div>

        {/* Value Assurance Badges */}
        <div className="mt-10 grid grid-cols-2 gap-3 border-y border-white/[0.08] py-6 sm:grid-cols-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#6f8cff]" />
            <span className="text-xs text-white/80 font-medium">100% IP & Code Ownership</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-[#6f8cff]" />
            <span className="text-xs text-white/80 font-medium">Agile Milestones & Delivery</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4 shrink-0 text-[#6f8cff]" />
            <span className="text-xs text-white/80 font-medium">Type-Safe Production Code</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-[#6f8cff]" />
            <span className="text-xs text-white/80 font-medium">14–30 Day Post-Launch Support</span>
          </div>
        </div>
      </section>

      {/* Pricing Packages Grid */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] pb-20 sm:w-[min(1280px,calc(100%-48px))]">
        <div className="grid gap-6 lg:grid-cols-3">
          {safePackages.map((pkg) => {
            const isFeatured = !!pkg.featured;
            const features = pkg.included_features || [];

            return (
              <article
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 sm:p-8 ${
                  isFeatured
                    ? "border-[#6f8cff]/45 bg-[linear-gradient(160deg,rgba(111,140,255,0.08),rgba(6,7,11,0.96))] shadow-xl shadow-[#6f8cff]/10 hover:border-[#6f8cff]/70"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035]"
                }`}
              >
                <div>
                  {/* Top tier badge */}
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                      {pkg.subtitle || "PACKAGE"}
                    </p>
                    {isFeatured && (
                      <span className="rounded-full border border-[#6f8cff]/40 bg-[#6f8cff]/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#6f8cff]">
                        Recommended
                      </span>
                    )}
                  </div>

                  {/* Tier name */}
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {pkg.package_name}
                  </h2>

                  {/* Price display */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    {pkg.custom_quote ? (
                      <span className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Custom Quote
                      </span>
                    ) : pkg.starting_price != null ? (
                      <>
                        <span className="font-mono text-xs uppercase tracking-wider text-white/40">
                          From
                        </span>
                        <span className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl tabular-nums">
                          {pkg.currency === "NGN" ? "₦" : (pkg.currency || "$") + " "}
                          {Number(pkg.starting_price).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Let’s Discuss
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="mt-4 text-xs leading-relaxed text-white/60 sm:text-sm">
                      {pkg.description}
                    </p>
                  )}

                  {/* Features list */}
                  <div className="mt-8 pt-6 border-t border-white/[0.08]">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-3.5">
                      Included in Scope
                    </p>
                    <ul className="space-y-3">
                      {features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-white/75 sm:text-sm">
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#6f8cff]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="mt-10 pt-6 border-t border-white/[0.08]">
                  <Link
                    href={pkg.cta_url || "/quote"}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      isFeatured
                        ? "bg-white text-[#06070b] hover:bg-white/90 shadow-md"
                        : "border border-white/15 bg-white/[0.04] text-white hover:border-white/30 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{pkg.cta_text || "Choose Plan"}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bespoke / Retainer Card */}
        <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-[#6f8cff]">
                Flexible Engagements
              </span>
              <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Need ongoing technical support or a fractional engineer?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">
                For growth-stage startups and established businesses requiring active weekly
                feature sprints, codebase modernizations, or AI workflow automation. Retainers are
                reserved per month with guaranteed hours.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#06070b] transition hover:bg-white/90"
              >
                Inquire About Retainers
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
              >
                Submit Custom RFP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQs Section */}
      <section className="border-t border-white/[0.08] bg-[#050812]/50 py-16 sm:py-20">
        <div className="mx-auto w-[min(1280px,calc(100%-32px))] sm:w-[min(1280px,calc(100%-48px))]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6f8cff]">
              Pricing Transparency
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Common questions about payments and scoping.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {pricingFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/15"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#6f8cff]" />
                  <div>
                    <h3 className="text-sm font-semibold text-white sm:text-base">{faq.q}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Proposal & Negotiation Section */}
      <section className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:w-[min(1280px,calc(100%-48px))] sm:py-20">
        <div className="border-t border-white/[0.08] pt-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {settings.footer_heading || "Prefer a direct negotiation?"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">
                {settings.footer_text ||
                  "Budgets vary and scopes shift. If your requirements don’t fit neatly into a tier, let’s talk directly to structure something realistic."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#06070b] transition hover:bg-white/90"
              >
                Let&apos;s Negotiate
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}