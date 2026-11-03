"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  FlaskConical,
  Wrench,
  CreditCard,
  Palette,
  Sparkles,
  History,
  MessageSquare,
  FileSpreadsheet,
  Quote,
  Database,
  Navigation,
  Image as ImageIcon,
  Settings,
  Search,
  Trash2,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const groups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin-wikis", icon: LayoutDashboard },
      { label: "Database & SQL Hub", href: "/admin-wikis/database", icon: Database, badge: "Supabase" },
    ],
  },
  {
    label: "PAGES & CONTENT",
    items: [
      { label: "Homepage", href: "/admin-wikis/pages/home", icon: Home },
      { label: "About & Bio", href: "/admin-wikis/about", icon: User },
      { label: "Websites & Apps", href: "/admin-wikis/projects", icon: Briefcase },
      { label: "The Lab & AI", href: "/admin-wikis/lab", icon: FlaskConical },
      { label: "Services", href: "/admin-wikis/services", icon: Wrench },
      { label: "Pricing Packages", href: "/admin-wikis/pricing", icon: CreditCard },
      { label: "Visual Archive", href: "/admin-wikis/designs", icon: Palette },
      { label: "Skills & Toolkit", href: "/admin-wikis/skills", icon: Sparkles },
      { label: "Career Timeline", href: "/admin-wikis/experience", icon: History },
    ],
  },
  {
    label: "LEADS & CLIENTS",
    items: [
      { label: "Messages", href: "/admin-wikis/messages", icon: MessageSquare },
      { label: "Quote Requests", href: "/admin-wikis/quotes", icon: FileSpreadsheet },
      { label: "Testimonials", href: "/admin-wikis/testimonials", icon: Quote },
    ],
  },
  {
    label: "SYSTEM & CONFIG",
    items: [
      { label: "Navigation Menu", href: "/admin-wikis/navigation", icon: Navigation },
      { label: "Media Library", href: "/admin-wikis/media", icon: ImageIcon },
      { label: "Site Settings", href: "/admin-wikis/settings", icon: Settings },
      { label: "SEO & Social", href: "/admin-wikis/seo", icon: Search },
      { label: "Trash & Recovery", href: "/admin-wikis/trash", icon: Trash2 },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const contents = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <Link href="/admin-wikis" onClick={close} className="mb-6 block border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6f8cff] text-[#050812] font-black text-xs">
              WT
            </div>
            <div>
              <span className="block text-xs font-bold tracking-[0.2em] text-white">
                WIKIS TECH
              </span>
              <span className="block font-mono text-[10px] text-white/40">
                Portfolio Control Center
              </span>
            </div>
          </div>
        </Link>

        {/* Grouped Navigation */}
        <nav className="space-y-6" aria-label="Admin navigation">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2.5 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin-wikis" && pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-[#6f8cff]/15 text-[#6f8cff] font-semibold"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            active
                              ? "text-[#6f8cff]"
                              : "text-white/40 group-hover:text-white"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {"badge" in item && item.badge && (
                        <span className="rounded bg-[#6f8cff]/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#6f8cff]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Live Site Link */}
      <div className="pt-6 border-t border-white/[0.08] mt-6">
        <Link
          href="/"
          onClick={close}
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/70 transition hover:bg-white/[0.06] hover:text-white hover:border-white/20"
        >
          <span>View Live Portfolio</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#6f8cff]" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="flex min-h-14 items-center justify-between border-b border-white/10 bg-[#080a10] px-4 lg:hidden">
        <Link href="/admin-wikis" onClick={close} className="flex items-center gap-2 text-xs font-bold tracking-[.18em]">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#6f8cff] text-[10px] text-black font-black">
            WT
          </span>
          <span>WIKIS TECH</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white"
          aria-label="Open admin navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {open && (
        <button
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] border-r border-white/10 bg-[#080a10] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-5">
          <div className="mb-2 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {contents}
        </div>
      </aside>
    </>
  );
}
