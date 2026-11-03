import { createClient } from "@/lib/supabase/server";
import { restoreItem, permanentlyDeleteItem } from "./actions";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  FlaskConical,
  Wrench,
  CreditCard,
  Palette,
  Quote,
  Layers,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ restored?: string; deleted?: string; error?: string }>;
};

interface TrashRow {
  id: string;
  title: string;
  table: "projects" | "experiments" | "services" | "pricing_packages" | "designs" | "testimonials";
  label: string;
  deleted_at: string;
}

export default async function AdminTrashPage({ searchParams }: Props) {
  const { restored, deleted, error } = await searchParams;
  const s = await createClient();

  const [
    { data: projects },
    { data: experiments },
    { data: services },
    { data: pricing },
    { data: designs },
    { data: testimonials },
  ] = await Promise.all([
    s.from("projects").select("id,title,deleted_at").not("deleted_at", "is", null),
    s.from("experiments").select("id,title,deleted_at").not("deleted_at", "is", null),
    s.from("services").select("id,title,deleted_at").not("deleted_at", "is", null),
    s.from("pricing_packages").select("id,package_name,deleted_at").not("deleted_at", "is", null),
    s.from("designs").select("id,title,deleted_at").not("deleted_at", "is", null),
    s.from("testimonials").select("id,name,deleted_at").not("deleted_at", "is", null),
  ]);

  const allTrash: TrashRow[] = [
    ...(projects ?? []).map((x) => ({
      id: x.id,
      title: x.title,
      table: "projects" as const,
      label: "Website / Project",
      deleted_at: x.deleted_at!,
    })),
    ...(experiments ?? []).map((x) => ({
      id: x.id,
      title: x.title,
      table: "experiments" as const,
      label: "Lab Experiment",
      deleted_at: x.deleted_at!,
    })),
    ...(services ?? []).map((x) => ({
      id: x.id,
      title: x.title,
      table: "services" as const,
      label: "Service Offering",
      deleted_at: x.deleted_at!,
    })),
    ...(pricing ?? []).map((x) => ({
      id: x.id,
      title: x.package_name,
      table: "pricing_packages" as const,
      label: "Pricing Package",
      deleted_at: x.deleted_at!,
    })),
    ...(designs ?? []).map((x) => ({
      id: x.id,
      title: x.title,
      table: "designs" as const,
      label: "Visual Design",
      deleted_at: x.deleted_at!,
    })),
    ...(testimonials ?? []).map((x) => ({
      id: x.id,
      title: `Endorsement from ${x.name}`,
      table: "testimonials" as const,
      label: "Testimonial",
      deleted_at: x.deleted_at!,
    })),
  ].sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6f8cff] uppercase">
            SYSTEM &amp; CONFIG / RECOVERY
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            Trash &amp; Content Recovery
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Recover accidentally removed case studies, services, pricing, or media without data loss.
          </p>
        </div>

        <div className="font-mono text-xs text-white/40">
          <span>{allTrash.length} items in trash</span>
        </div>
      </div>

      {/* Notifications */}
      {restored && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold text-emerald-300">Item restored successfully to active portfolio!</p>
        </div>
      )}

      {deleted && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6f8cff]" />
          <p className="font-semibold text-blue-300">Item permanently deleted from Supabase.</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="font-semibold text-rose-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Trash Items List */}
      <section className="space-y-4">
        {allTrash.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.015] p-12 text-center">
            <Trash2 className="h-10 w-10 text-white/20 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-white">Trash is Empty</h2>
            <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto">
              No deleted items exist. Whenever you remove a project, service, package, or testimonial, it will safely appear here for 1-click restore.
            </p>
            <div className="mt-6">
              <Link
                href="/admin-wikis"
                className="inline-block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {allTrash.map((item) => (
              <div
                key={`${item.table}-${item.id}`}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center transition hover:bg-white/[0.02]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-white/60 uppercase">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] text-white/30">
                      Deleted {new Date(item.deleted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="font-mono text-[10px] text-white/30">ID: {item.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Restore Form */}
                  <form action={restoreItem}>
                    <input type="hidden" name="table" value={item.table} />
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Restore to Portfolio</span>
                    </button>
                  </form>

                  {/* Permanent Delete Form */}
                  <form action={permanentlyDeleteItem}>
                    <input type="hidden" name="table" value={item.table} />
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete Forever</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
