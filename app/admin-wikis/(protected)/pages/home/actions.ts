"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

const heroSchema = z.object({
  eyebrow: z.string().trim().max(200).default("OKOH WISDOM / WIKIS TECH"),
  line1: z.string().trim().min(1, "Headline Line 1 is required").max(120),
  line2: z.string().trim().max(120).default(""),
  supporting: z.string().trim().max(1000).default(""),
  availabilityMessage: z.string().trim().max(300).default(""),
  primaryLabel: z.string().trim().max(100).default("View My Work"),
  primaryUrl: z.string().trim().max(500).default("/work"),
  secondaryLabel: z.string().trim().max(100).default("Let's Talk"),
  secondaryUrl: z.string().trim().max(500).default("/contact"),
  words: z.array(z.string().trim().max(50)).min(1, "At least one rotating word is required"),
  interval: z.number().int().min(500).max(20000).default(2200),
  // Allow relative paths like /wikis.png, local assets, data URLs, or full URLs:
  heroMediaUrl: z.string().trim().max(1000).default("/wikis.png"),
});

export async function saveHome(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const rawWords = String(fd.get("rotatingWords") ?? "")
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);

  const words = rawWords.length > 0 ? rawWords : ["MOVE", "WORK", "SCALE", "CONVERT"];

  const parsed = heroSchema.safeParse({
    eyebrow: String(fd.get("eyebrow") ?? ""),
    line1: String(fd.get("line1") ?? "Okoh Wisdom"),
    line2: String(fd.get("line2") ?? "Uchechukwu"),
    supporting: String(fd.get("supporting") ?? ""),
    availabilityMessage: String(fd.get("availabilityMessage") ?? ""),
    primaryLabel: String(fd.get("primaryLabel") ?? "View My Work"),
    primaryUrl: String(fd.get("primaryUrl") ?? "/work"),
    secondaryLabel: String(fd.get("secondaryLabel") ?? "Let's Talk"),
    secondaryUrl: String(fd.get("secondaryUrl") ?? "/contact"),
    words,
    interval: Number(fd.get("interval") || 2200),
    heroMediaUrl: String(fd.get("heroMediaUrl") ?? "/wikis.png").trim() || "/wikis.png",
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin-wikis/pages/home?error=${encodeURIComponent(errorMsg)}`);
  }

  const s = await createClient();
  const v = parsed.data;

  try {
    // Upsert into hero_settings ensuring row exists even on fresh database:
    const { error: heroError } = await s
      .from("hero_settings")
      .upsert(
        {
          singleton_key: "default",
          eyebrow: v.eyebrow,
          headline_line_1: v.line1,
          headline_line_2: v.line2,
          supporting_text: v.supporting,
          availability_enabled: fd.get("availabilityEnabled") === "on",
          availability_message: v.availabilityMessage,
          primary_cta_label: v.primaryLabel,
          primary_cta_url: v.primaryUrl,
          secondary_cta_label: v.secondaryLabel,
          secondary_cta_url: v.secondaryUrl,
          rotating_words: v.words,
          rotation_enabled: fd.get("rotationEnabled") === "on",
          rotation_interval_ms: v.interval,
          hero_media_url: v.heroMediaUrl,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "singleton_key" },
      );

    if (heroError) {
      console.error("Failed to update hero_settings in Supabase:", heroError);
      redirect(
        `/admin-wikis/pages/home?error=${encodeURIComponent(
          "Supabase Database Error: " + (heroError.message || "Failed to update hero settings."),
        )}`,
      );
    }

    // Update page section ordering/visibility if provided:
    const ids = fd.getAll("sectionId").map(String);
    for (const id of ids) {
      const order = Number(fd.get(`order:${id}`) || 0);
      const enabled = fd.get(`enabled:${id}`) === "on";
      await s
        .from("page_sections")
        .update({
          sort_order: order,
          enabled,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    // Insert activity log safely:
    try {
      await s.from("activity_logs").insert({
        user_id: user.id,
        action: "Homepage updated",
        entity_type: "home",
      });
    } catch {
      // Non-fatal if activity log fails
    }

    // Purge caches:
    revalidatePath("/");
    revalidatePath("/admin-wikis/pages/home");
    revalidatePath("/admin-wikis");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("saveHome exception:", err);
    redirect(
      `/admin-wikis/pages/home?error=${encodeURIComponent(
        err?.message || "An unexpected error occurred while saving homepage settings.",
      )}`,
    );
  }

  redirect("/admin-wikis/pages/home?saved=true");
}