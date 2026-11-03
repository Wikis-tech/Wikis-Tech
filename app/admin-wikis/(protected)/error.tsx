"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error", error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[55vh] max-w-2xl place-items-center py-12 px-4">
      <section className="w-full rounded-3xl border border-white/[.08] bg-white/[.025] p-7 text-center sm:p-10 shadow-2xl">
        <p className="text-xs font-semibold tracking-[.18em] text-[#8097ff] uppercase">ADMIN RECOVERY</p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
          This admin page hit a temporary error.
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/50 max-w-lg mx-auto">
          Your portfolio content is still safe. Retry the page first. If your session became stale after a deployment, return to the dashboard or sign in again.
        </p>
        {error.digest && <p className="mt-4 text-xs font-mono text-white/30">Reference: {error.digest}</p>}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 shadow-md"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Reload page
          </button>
          <Link
            href="/admin-wikis"
            className="rounded-xl border border-[#6f8cff]/30 bg-[#6f8cff]/10 px-5 py-2.5 text-xs font-medium text-[#6f8cff] transition hover:bg-[#6f8cff]/20"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/admin-wikis/login"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Sign in again
          </Link>
        </div>
      </section>
    </main>
  );
}
