"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";
import { pricingInput } from "@/features/phase6/validation";

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

function parse(fd: FormData) {
  const result = pricingInput.safeParse({
    name: String(fd.get("name") ?? "").trim() || "Website / Web App Build",
    subtitle: String(fd.get("subtitle") ?? "").trim(),
    currency: String(fd.get("currency") ?? "NGN").toUpperCase(),
    price: fd.get("price") ? Number(fd.get("price")) : null,
    customQuote: fd.get("customQuote") === "on",
    description: String(fd.get("description") ?? "").trim(),
    features: lines(fd.get("features")),
    ctaText: String(fd.get("ctaText") ?? "Request a Quote ↗"),
    ctaUrl: String(fd.get("ctaUrl") ?? "/contact"),
    featured: fd.get("featured") === "on",
    visible: fd.get("visible") === "on",
    sortOrder: Number(fd.get("sortOrder") || 0),
  });
  return result;
}

export async function savePricingSettings(fd: FormData) {
  let u;
  try {
    u = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const s = await createClient();
  const heading = String(fd.get("heading") ?? "").trim().slice(0, 160) || "Transparent Pricing & Scope Packages";
  const description = String(fd.get("description") ?? "").trim().slice(0, 1000) || "Predictable engineering rates, milestone-based deliverables, and dedicated retainers.";
  const footerHeading = String(fd.get("footerHeading") ?? "").trim().slice(0, 160) || "Have a Unique Problem to Solve?";
  const footerText = String(fd.get("footerText") ?? "").trim().slice(0, 1000) || "I design tailored solutions for complex architectures, AI systems, and venture builds.";

  try {
    const { error } = await s
      .from("pricing_settings")
      .upsert(
        {
          singleton_key: "default",
          enabled: fd.get("enabled") === "on",
          heading,
          description,
          footer_heading: footerHeading,
          footer_text: footerText,
          updated_by: u.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "singleton_key" },
      );

    if (error) {
      redirect(`/admin-wikis/pricing?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/pricing");
    revalidatePath("/");
    revalidatePath("/admin-wikis/pricing");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect(`/admin-wikis/pricing?error=${encodeURIComponent(err?.message || "Could not save settings.")}`);
  }

  redirect("/admin-wikis/pricing?saved=true");
}

export async function createPackage(fd: FormData) {
  const u = await requireCmsUser();
  const parsed = parse(fd);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please review the package fields.";
    redirect(`/admin-wikis/pricing?error=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data;
  const s = await createClient();
  const { data, error } = await s
    .from("pricing_packages")
    .insert({
      package_name: v.name,
      subtitle: v.subtitle || null,
      currency: v.currency,
      starting_price: v.price,
      custom_quote: v.customQuote,
      description: v.description || null,
      included_features: v.features,
      cta_text: v.ctaText,
      cta_url: v.ctaUrl,
      featured: v.featured,
      visibility: v.visible,
      sort_order: v.sortOrder,
      created_by: u.id,
      updated_by: u.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin-wikis/pricing?error=${encodeURIComponent(error.message)}`);
  }

  await s.from("activity_logs").insert({
    user_id: u.id,
    action: "Pricing package created",
    entity_type: "pricing",
    entity_id: data.id,
  });

  revalidatePath("/pricing");
  revalidatePath("/");
  redirect(`/admin-wikis/pricing/${data.id}?saved=true`);
}

export async function savePackage(fd: FormData) {
  const u = await requireCmsUser();
  const id = String(fd.get("id"));
  const parsed = parse(fd);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please review the package fields.";
    redirect(`/admin-wikis/pricing/${id}?error=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data;
  const s = await createClient();
  const { error } = await s
    .from("pricing_packages")
    .update({
      package_name: v.name,
      subtitle: v.subtitle || null,
      currency: v.currency,
      starting_price: v.price,
      custom_quote: v.customQuote,
      description: v.description || null,
      included_features: v.features,
      cta_text: v.ctaText,
      cta_url: v.ctaUrl,
      featured: v.featured,
      visibility: v.visible,
      sort_order: v.sortOrder,
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin-wikis/pricing/${id}?error=${encodeURIComponent(error.message)}`);
  }

  await s.from("activity_logs").insert({
    user_id: u.id,
    action: "Pricing package updated",
    entity_type: "pricing",
    entity_id: id,
  });

  revalidatePath("/pricing");
  revalidatePath("/");
  revalidatePath(`/admin-wikis/pricing/${id}`);
  redirect(`/admin-wikis/pricing/${id}?saved=true`);
}

export async function trashPackage(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  await s
    .from("pricing_packages")
    .update({
      deleted_at: new Date().toISOString(),
      visibility: false,
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/pricing");
  revalidatePath("/");
  redirect("/admin-wikis/pricing?saved=true");
}

export async function duplicatePackage(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  const { data: x, error: fetchErr } = await s.from("pricing_packages").select("*").eq("id", id).single();
  if (fetchErr || !x) {
    redirect(`/admin-wikis/pricing?error=${encodeURIComponent("Package not found.")}`);
  }
  const { data: copy, error } = await s
    .from("pricing_packages")
    .insert({
      package_name: `${x.package_name} Copy`,
      subtitle: x.subtitle,
      currency: x.currency,
      starting_price: x.starting_price,
      custom_quote: x.custom_quote,
      description: x.description,
      included_features: x.included_features,
      cta_text: x.cta_text,
      cta_url: x.cta_url,
      featured: false,
      visibility: false,
      sort_order: x.sort_order + 1,
      created_by: u.id,
      updated_by: u.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin-wikis/pricing?error=${encodeURIComponent("Could not duplicate package.")}`);
  }

  await s.from("activity_logs").insert({
    user_id: u.id,
    action: "Pricing package duplicated",
    entity_type: "pricing",
    entity_id: copy.id,
  });

  revalidatePath("/pricing");
  revalidatePath("/");
  redirect(`/admin-wikis/pricing/${copy.id}?saved=true`);
}