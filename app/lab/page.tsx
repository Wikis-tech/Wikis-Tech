import { getPageMetadata } from "@/lib/site/seo";
import { fallbackLab } from "@/lib/site/fallback-content";
import { PublicFooter } from "@/components/portfolio/public-footer";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/portfolio/public-nav";
import { LabPageClient, type ExperimentItem, type CraftSettings } from "@/components/portfolio/lab-page-client";

export async function generateMetadata() {
  return getPageMetadata("lab", {
    title: "Lab — Okoh Wisdom",
    description: "Experiments, prototypes and interface studies exploring useful ideas through code, AI and design.",
    path: "/lab",
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LabPage() {
  const s = await createClient();
  const [{ data: items }, { data: craft }] = await Promise.all([
    s
      .from("experiments")
      .select("id,title,slug,description,status,technology,image_url,featured,experiment_date,demo_url,github_url")
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("sort_order"),
    s.from("craft_settings").select("*").eq("singleton_key", "default").single(),
  ]);

  const safeItems = (items?.length ? items : fallbackLab) as ExperimentItem[];

  return (
    <main className="public-page min-h-screen bg-[#06070b] text-white">
      <PublicNav />

      {/* Hero Header with Disciplined Typographic Scale */}
      <section data-reveal="up" className="mx-auto w-[min(1280px,calc(100%-32px))] pt-16 pb-12 sm:w-[min(1280px,calc(100%-40px))] sm:pt-20 sm:pb-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
          THE LAB / EXPLORATION & PROTOTYPES
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.14]">
            Curiosity, prototypes, and applied AI systems.
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-white/50">
            A dedicated playground for software experiments, interface explorations, and prompt frameworks built to test hypotheses before production.
          </p>
        </div>
      </section>

      {/* Interactive Experiments Showcase & Framework */}
      <LabPageClient items={safeItems} craft={craft as CraftSettings | null} />

      <PublicFooter />
    </main>
  );
}