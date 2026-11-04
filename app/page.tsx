import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { ContactForm } from "@/components/forms/contact-form";
import { LegacyHeroRotator } from "@/components/portfolio/legacy-hero-rotator";
import { TestimonialsCarousel, type TestimonialItem } from "@/components/portfolio/testimonials-carousel";
import { getSiteSettings } from "@/lib/site/content";
import { getPageMetadata } from "@/lib/site/seo";
import {
  fallbackExperience,
  fallbackLab,
  fallbackProjects,
  fallbackServices,
  fallbackSkills,
} from "@/lib/site/fallback-content";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

export async function generateMetadata() {
  return getPageMetadata("home", {
    title: "Okoh Wisdom — Websites, Digital Products & Intelligent Tools",
    description:
      "Software developer, digital product builder and creative technologist combining code, design, AI and strategy.",
    path: "/",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Snapshot = {
  problem?: string;
  outcome?: string;
  live_url?: string | null;
  card_media_url?: string | null;
};

export default async function HomePage() {
  const s = await createClient();

  const [
    site,
    { data: hero },
    { data: about },
    { data: skills },
    { data: experience },
    { data: projects },
    { data: testimonials },
    { data: services },
    { data: experiments },
    { data: designs },
  ] = await Promise.all([
    getSiteSettings(),
    s.from("hero_settings").select("*").eq("singleton_key", "default").maybeSingle(),
    s.from("about_profile").select("*").eq("singleton_key", "default").maybeSingle(),
    s.from("skills").select("id,name,group_name,sort_order").eq("is_visible", true).order("sort_order"),
    s
      .from("experiences")
      .select("id,company,position,start_date,end_date,current_position,description,sort_order")
      .eq("is_visible", true)
      .order("sort_order"),
    // Limit strictly to 4 projects for clean, uncluttered landing page presentation:
    s
      .from("project_publications")
      .select("project_id,slug,title,short_description,status,featured,snapshot,published_at")
      .order("featured", { ascending: false })
      .order("sort_order")
      .limit(4),
    // Fetch up to 20 client endorsements/testimonials:
    s
      .from("testimonials")
      .select("id,name,position,company,photo_url,quote,featured,sort_order")
      .eq("visibility", true)
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(20),
    s
      .from("services")
      .select("id,title,short_description,full_description,starting_price,currency,cta_url,featured")
      .eq("enabled", true)
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("sort_order")
      .limit(6),
    s
      .from("experiments")
      .select("id,title,slug,description,status,technology,image_url,featured")
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("sort_order")
      .limit(4),
    s
      .from("designs")
      .select("id,title,client,image_url,year")
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("sort_order")
      .limit(6),
  ]);

  const safeSkills = skills?.length ? skills : fallbackSkills;
  const safeExperience = experience?.length ? experience : fallbackExperience;
  const safeProjects = (projects?.length ? projects : fallbackProjects).slice(0, 4);
  // Only display real testimonials directly from Supabase (never inject mock/fallback testimonials):
  const safeTestimonials = (testimonials ?? []) as TestimonialItem[];
  const safeServices = services?.length ? services : fallbackServices;
  const safeExperiments = experiments?.length ? experiments : fallbackLab;

  const words = Array.isArray(hero?.rotating_words)
    ? hero.rotating_words.filter((x: unknown): x is string => typeof x === "string")
    : ["WORK.", "CONNECT.", "CONVERT.", "SCALE.", "MOVE."];
  const portrait = hero?.hero_media_url || about?.portrait_url || "/wikis.png";

  return (
    <main className="legacy-site public-page">
      <PublicNav />

      {/* HERO SECTION */}
      <section className="legacy-hero" id="home">
        <div className="legacy-grid-lines" aria-hidden />
        <div className="legacy-hero-left">
          <p className="legacy-kicker">{hero?.eyebrow || "SOFTWARE · DESIGN · AI · STRATEGY"}</p>
          <h1 className="legacy-hero-name">
            {site.professional_name?.split(" ")[0] || "Okoh"}
            <br />
            <span>{site.professional_name?.split(" ").slice(1).join(" ") || "Wisdom"}</span>
          </h1>
          <p className="legacy-hero-role">
            I build websites & digital products that{" "}
            <LegacyHeroRotator words={words} enabled={hero?.rotation_enabled ?? true} intervalMs={hero?.rotation_interval_ms ?? 2200} />
          </p>
          <p className="legacy-hero-desc">
            {hero?.supporting_text ||
              "I turn ideas and business problems into useful websites, digital products and intelligent tools — combining software, design, AI and strategy."}
          </p>
          <div className="legacy-hero-actions">
            <Link href="/work" className="legacy-btn-primary">
              View My Work <span>↗</span>
            </Link>
            <Link href="/contact" className="legacy-btn-outline">
              Let&apos;s Talk <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="legacy-hero-right">
          <div className="legacy-hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt={`${site.professional_name} portrait`} />
          </div>
          <div className="legacy-photo-overlay" />
          <div className="legacy-photo-overlay-bottom" />
          <div className="legacy-photo-tint" />
        </div>
        <div className="legacy-stats">
          <div>
            <strong>{safeExperience.length}+</strong>
            <span>Experience entries</span>
          </div>
          <div>
            <strong>{safeProjects.length}+</strong>
            <span>Selected builds</span>
          </div>
          <div>
            <strong>{safeSkills.length}+</strong>
            <span>Skills &amp; capabilities</span>
          </div>
        </div>
        <div className="legacy-scroll">
          <i />
          <span>Scroll</span>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="legacy-section legacy-about" id="about" data-reveal="up">
        <div className="legacy-about-grid">
          <div className="legacy-about-media" data-reveal="left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt={`${site.professional_name} portrait`} />
            <span className="legacy-about-accent" />
            <div className="legacy-about-badge">
              <strong>CODE</strong>
              <span>× DESIGN × AI × STRATEGY</span>
            </div>
          </div>
          <div>
            <p className="legacy-section-label">About Me</p>
            <h2 className="legacy-section-title">
              {about?.headline || "Problem-solver. Product builder. Creative technologist."}
            </h2>
            <p className="legacy-body-copy">{about?.introduction || site.tagline}</p>
            <p className="legacy-body-copy">
              {about?.biography ||
                "I combine software development, design, AI and business thinking to build useful digital experiences."}
            </p>
            <div className="legacy-highlight-grid">
              <div>
                <strong>Digital Products</strong>
                <span>Websites, platforms and product systems built around real problems.</span>
              </div>
              <div>
                <strong>Creative Technology</strong>
                <span>Design, interface thinking and visual communication that support the product.</span>
              </div>
              <div>
                <strong>AI & Automation</strong>
                <span>Practical AI-assisted workflows, research and intelligent tools.</span>
              </div>
              <div>
                <strong>Business Thinking</strong>
                <span>Research, data and strategy that keep the work commercially grounded.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="legacy-section legacy-skills" id="skills" data-reveal="up">
        <div className="legacy-section-head">
          <div>
            <p className="legacy-section-label">Capabilities</p>
            <h2 className="legacy-section-title">What I Build With</h2>
          </div>
          <p>
            I work across code, design, AI and strategy. The tool changes; the goal stays the same: solve the problem well.
          </p>
        </div>
        <div className="legacy-skill-grid">
          {safeSkills.slice(0, 12).map((x, i) => (
            <article key={x.id} className="legacy-skill-card" data-reveal="up" data-delay={Math.min(i * 45, 300)}>
              <span>{x.group_name}</span>
              <h3>{x.name}</h3>
              <p>Part of my working toolkit for designing and building useful digital experiences.</p>
            </article>
          ))}
        </div>
      </section>

      {/* CAREER TIMELINE */}
      <section className="legacy-section legacy-experience" id="experience" data-reveal="up">
        <div className="legacy-section-head">
          <div>
            <p className="legacy-section-label">Career Timeline</p>
            <h2 className="legacy-section-title">Where I&apos;ve Built Real Experience</h2>
          </div>
        </div>
        <div className="legacy-timeline">
          {safeExperience.map((x) => (
            <article key={x.id} className="legacy-timeline-item">
              <i />
              <p className="legacy-timeline-date">
                {x.start_date?.slice(0, 4) || ""} — {x.current_position ? "Present" : x.end_date?.slice(0, 4) || ""}
              </p>
              <h3>{x.position}</h3>
              <h4>{x.company}</h4>
              {x.description && <p>{x.description}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* SELECTED WORK SECTION (CAPPED AT 4 PROJECTS + VIEW MORE BUTTON) */}
      <section className="legacy-section legacy-projects" id="projects" data-reveal="up">
        <div className="legacy-section-head">
          <div>
            <p className="legacy-section-label">Selected Work</p>
            <h2 className="legacy-section-title">Projects I&apos;ve Built &amp; Shipped</h2>
          </div>
          <Link href="/work" className="legacy-text-link">
            Explore all work ↗
          </Link>
        </div>

        {/* 4 Featured Projects Grid */}
        <div className="legacy-project-grid">
          {safeProjects.map((p, i) => {
            const snap = (p.snapshot ?? {}) as Snapshot;
            const href = snap.live_url || `/work/${p.slug}`;
            return (
              <article key={p.project_id} className="legacy-project-card" data-reveal="up" data-delay={Math.min(i * 70, 320)}>
                {snap.card_media_url ? (
                  <a
                    href={href}
                    target={snap.live_url ? "_blank" : undefined}
                    rel={snap.live_url ? "noreferrer" : undefined}
                    className="legacy-project-image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={snap.card_media_url} alt={p.title} />
                  </a>
                ) : null}
                <span className="legacy-project-number">{String(i + 1).padStart(2, "0")}</span>
                <p className="legacy-project-status">{p.status.replaceAll("_", " ")}</p>
                <h3>{p.title}</h3>
                <p>{snap.problem || p.short_description}</p>
                {snap.outcome && <p className="legacy-project-outcome">What changed → {snap.outcome}</p>}
                <div className="legacy-project-actions">
                  <Link href={`/work/${p.slug}`}>Case study →</Link>
                  {snap.live_url ? (
                    <a href={snap.live_url} target="_blank" rel="noreferrer">
                      Live site ↗
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {/* View More Projects Action Card */}
        <div className="mt-10 mx-auto max-w-[1300px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(111,140,255,0.06),rgba(5,8,18,0.7))] p-6 sm:p-8 backdrop-blur-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[#6f8cff] uppercase">
                <Layers className="h-3.5 w-3.5" />
                <span>Full Portfolio &amp; Engineering Studies</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                Looking for more websites, tools, and digital systems?
              </h3>
              <p className="text-xs sm:text-sm text-white/50 max-w-xl">
                Browse the complete archive of live platforms, client deliverables, mobile webapps, and technical case studies on the Work page.
              </p>
            </div>

            <Link
              href="/work"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-xs font-bold text-black transition hover:bg-white/90 hover:scale-[1.02] shadow-xl"
            >
              <span>View All Websites &amp; Apps</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (HORIZONTAL SCROLLABLE, UP TO 20) */}
      {safeTestimonials.length > 0 && (
        <section className="legacy-section legacy-testimonials" id="testimonials" data-reveal="up">
          <div className="legacy-section-head">
            <div>
              <p className="legacy-section-label">Client Endorsements</p>
              <h2 className="legacy-section-title">What Collaborators Say</h2>
            </div>
            <p>
              Verified reviews from founders, product leaders, and businesses I&apos;ve built and shipped digital solutions for.
            </p>
          </div>

          <div className="mx-auto max-w-[1300px]">
            <TestimonialsCarousel testimonials={safeTestimonials} />
          </div>
        </section>
      )}

      {/* SERVICES SECTION */}
      {safeServices.length ? (
        <section className="legacy-section legacy-services" id="services" data-reveal="up">
          <div className="legacy-section-head">
            <div>
              <p className="legacy-section-label">Services</p>
              <h2 className="legacy-section-title">How I Can Help</h2>
            </div>
            <Link href="/services" className="legacy-text-link">
              View services ↗
            </Link>
          </div>
          <div className="legacy-service-grid">
            {safeServices.map((x, i) => (
              <article key={x.id} className="legacy-service-card">
                <span>0{i + 1}</span>
                <h3>{x.title}</h3>
                <p>{x.full_description || x.short_description}</p>
                {x.starting_price != null ? (
                  <small>
                    From {x.currency === "NGN" ? "₦" : x.currency + " "}
                    {Number(x.starting_price).toLocaleString()}
                  </small>
                ) : null}
                <Link href={x.cta_url || "/contact"}>Discuss this ↗</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* DESIGN ARCHIVE */}
      {designs?.length ? (
        <section className="legacy-section legacy-archive" data-reveal="up">
          <div className="legacy-section-head">
            <div>
              <p className="legacy-section-label">Visual Archive</p>
              <h2 className="legacy-section-title">Design Work That Communicates</h2>
            </div>
            <Link href="/archive" className="legacy-text-link">
              Open archive ↗
            </Link>
          </div>
          <div className="legacy-masonry">
            {designs.map((d) => (
              <Link href="/archive" key={d.id} className="legacy-design-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image_url} alt={d.title} />
                <div>
                  <span>{d.year || "Design"}</span>
                  <h3>{d.title}</h3>
                  <p>{d.client}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* THE LAB */}
      {safeExperiments.length ? (
        <section className="legacy-section legacy-lab" data-reveal="up">
          <div className="legacy-section-head">
            <div>
              <p className="legacy-section-label">The Lab</p>
              <h2 className="legacy-section-title">Curiosity, Prototypes &amp; Experiments</h2>
            </div>
            <Link href="/lab" className="legacy-text-link">
              Enter the Lab ↗
            </Link>
          </div>
          <div className="legacy-lab-grid">
            {safeExperiments.map((x) => (
              <Link key={x.id} href={`/lab/${x.slug}`} className="legacy-lab-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {x.image_url ? <img src={x.image_url} alt="" /> : null}
                <span>{x.status.replaceAll("_", " ")}</span>
                <h3>{x.title}</h3>
                <p>{x.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* CONTACT SECTION */}
      <section className="legacy-section legacy-contact" id="contact" data-reveal="up">
        <div className="legacy-contact-grid">
          <div>
            <p className="legacy-section-label">Get In Touch</p>
            <h2 className="legacy-contact-title">
              Let&apos;s Build
              <br />
              Something <em>Useful</em>
              <br />
              Together
            </h2>
            <p className="legacy-body-copy">
              Have a product, website, design, research or automation problem? Tell me what needs to work better and what a good outcome looks like.
            </p>
            {site.contact_email ? (
              <a className="legacy-contact-link" href={`mailto:${site.contact_email}`}>
                {site.contact_email}
              </a>
            ) : null}
            {site.location ? <p className="legacy-contact-location">{site.location}</p> : null}
          </div>
          <div className="legacy-contact-form">
            <ContactForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
