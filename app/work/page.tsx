import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { getPageMetadata } from "@/lib/site/seo";
import { fallbackProjects } from "@/lib/site/fallback-content";
import { verifiedBuilds } from "@/lib/site/verified-builds";
import { WorkPageClient, type ProjectItem, type DesignItem } from "@/components/portfolio/work-page-client";

export async function generateMetadata() {
  return getPageMetadata("work", {
    title: "Selected Work — Okoh Wisdom",
    description: "Case studies showing the problem, what I built, why it mattered and what changed.",
    path: "/work",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkPage() {
  const s = await createClient();
  const [{ data: projects }, { data: designs }] = await Promise.all([
    s
      .from("project_publications")
      .select("project_id,slug,title,short_description,status,confidential,snapshot,published_at")
      .order("sort_order")
      .order("published_at", { ascending: false }),
    s
      .from("designs")
      .select("id,title,client,year,description,image_url,tags,design_categories(name)")
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("sort_order"),
  ]);

  const projectRows = (projects?.length ? projects : fallbackProjects) as ProjectItem[];

  return (
    <main className="public-page min-h-screen bg-[#050812] text-white">
      <PublicNav />

      {/* Hero Header with Disciplined Typographic Scale */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] pt-16 pb-12 sm:w-[min(1280px,calc(100%-40px))] sm:pt-20 sm:pb-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
          PORTFOLIO ARCHIVE / SELECTED WORK
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.12]">
            Software systems, digital products & engineering studies.
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-white/50">
            Case studies detailing the original problem, technical implementation, and measurable outcomes. Built with clean code and product thinking.
          </p>
        </div>
      </section>

      {/* Interactive Case Studies & Builds Showcase */}
      <WorkPageClient
        projects={projectRows}
        verifiedBuilds={verifiedBuilds}
        designs={designs as DesignItem[] | null}
      />

      <PublicFooter />
    </main>
  );
}
