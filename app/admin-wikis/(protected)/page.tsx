import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";
import {
  Briefcase,
  Layers,
  FlaskConical,
  Wrench,
  CreditCard,
  User,
  Home,
  Database,
  ArrowUpRight,
  Plus,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const s = await createClient();
  const env = getSupabaseEnv();

  const [
    { count: mediaCount },
    { count: publishedCount },
    { count: draftsCount },
    { count: messagesCount },
    { count: quotesCount },
    { count: experimentsCount },
    { count: servicesCount },
    { count: pricingCount },
    { data: activity },
  ] = await Promise.all([
    s.from("media_library").select("*", { count: "exact", head: true }).is("deleted_at", null),
    s.from("project_publications").select("*", { count: "exact", head: true }),
    s.from("projects").select("*", { count: "exact", head: true }).eq("visibility", "draft").is("deleted_at", null),
    s.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
    s.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    s.from("experiments").select("*", { count: "exact", head: true }).is("deleted_at", null),
    s.from("services").select("*", { count: "exact", head: true }).is("deleted_at", null),
    s.from("pricing_packages").select("*", { count: "exact", head: true }).is("deleted_at", null),
    s.from("activity_logs").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const publicPages = [
    { name: "Homepage", path: "/", editHref: "/admin-wikis/pages/home", icon: Home, desc: "Hero, rotating words & sections" },
    { name: "Work & Projects", path: "/work", editHref: "/admin-wikis/projects", icon: Briefcase, desc: `${publishedCount ?? 0} published builds` },
    { name: "About Me", path: "/about", editHref: "/admin-wikis/about", icon: User, desc: "Bio, philosophy & experience" },
    { name: "The Lab", path: "/lab", editHref: "/admin-wikis/lab", icon: FlaskConical, desc: `${experimentsCount ?? 0} experiments & CRAFT` },
    { name: "Services", path: "/services", editHref: "/admin-wikis/services", icon: Wrench, desc: `${servicesCount ?? 0} active service offerings` },
    { name: "Pricing", path: "/pricing", editHref: "/admin-wikis/pricing", icon: CreditCard, desc: `${pricingCount ?? 0} scope tiers & retainers` },
  ];

  return (
    <main className="mx-auto max-w-[1440px] space-y-10">
      {/* Top Welcome & Handshake Banner */}
      <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
              Connected to Supabase · mgzvfhrnrrvbmajkrmgp
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Portfolio Control Center
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-2xl leading-relaxed">
            Manage your websites, product case studies, experiments, services, and live site content
            effortlessly. All changes sync directly to your Supabase database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin-wikis/database"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-4 py-2.5 text-xs font-semibold text-[#6f8cff] transition hover:bg-[#6f8cff]/20"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Database &amp; SQL Hub</span>
          </Link>
          <Link
            href="/admin-wikis/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Website or App</span>
          </Link>
        </div>
      </div>

      {/* Pages Content Hub: Direct 1-Click Editors */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Pages &amp; Content Editors</h2>
            <p className="text-xs text-white/40">Edit any page of your portfolio with zero stress.</p>
          </div>
          <span className="font-mono text-xs text-white/40">6 Core Pages</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicPages.map((pg) => {
            const Icon = pg.icon;
            return (
              <div
                key={pg.name}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.035]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#6f8cff]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Link
                      href={pg.path}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-white/40 hover:text-white transition"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-white">{pg.name}</h3>
                  <p className="mt-1 text-xs text-white/50">{pg.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-white/40">{pg.path}</span>
                  <Link
                    href={pg.editHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#6f8cff] group-hover:text-white transition-colors"
                  >
                    <span>Edit Content</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Portfolio Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-white/40">Published Projects</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-white">{publishedCount ?? 0}</span>
            <span className="text-xs text-white/40">{draftsCount ?? 0} in drafts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-white/40">New Inbound Leads</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-[#6f8cff]">
              {(messagesCount ?? 0) + (quotesCount ?? 0)}
            </span>
            <span className="text-xs text-white/40">
              {messagesCount ?? 0} msgs · {quotesCount ?? 0} quotes
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-white/40">Services &amp; Pricing</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-white">{servicesCount ?? 0}</span>
            <span className="text-xs text-white/40">{pricingCount ?? 0} packages</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-white/40">Media Assets</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-white">{mediaCount ?? 0}</span>
            <Link href="/admin-wikis/media" className="text-xs text-[#6f8cff] hover:underline">
              Library ↗
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions & Live Activity */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Quick Actions Bar */}
        <div className="space-y-4 lg:col-span-5">
          <h2 className="text-base font-semibold text-white">Quick Management Actions</h2>
          <div className="space-y-2">
            {[
              { label: "+ Add Website / Software Project", href: "/admin-wikis/projects/new" },
              { label: "+ Upload Graphic Design Work", href: "/admin-wikis/designs" },
              { label: "+ Add New Experiment or AI Prototype", href: "/admin-wikis/lab" },
              { label: "+ Add or Update Service Offering", href: "/admin-wikis/services" },
              { label: "+ Adjust Pricing Packages", href: "/admin-wikis/pricing" },
              { label: "+ Update Work Experience & Timeline", href: "/admin-wikis/experience" },
              { label: "+ Upload Images / Media to Library", href: "/admin-wikis/media" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-xs font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white hover:border-white/15"
              >
                <span>{action.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/40" />
              </Link>
            ))}
          </div>
        </div>

        {/* Live Activity Feed directly from Supabase activity_logs */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent CMS Activity</h2>
            <span className="font-mono text-xs text-white/40">Supabase activity_logs</span>
          </div>

          <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.015]">
            {activity && activity.length > 0 ? (
              activity.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6f8cff]" />
                    <span className="text-xs font-medium text-white/90">{item.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/50 uppercase">
                      {item.entity_type}
                    </span>
                    <span className="font-mono text-[11px] text-white/35">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-white/40">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}