"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

const brandImages = ["image/png", "image/jpeg", "image/webp", "image/avif"];

function safeAssetName(name: string) {
  const parts = name.toLowerCase().split(".");
  const ext = parts.length > 1 ? parts.pop()!.replace(/[^a-z0-9]/g, "") : "png";
  const base = parts.join(".").replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "brand";
  return `${base}.${ext}`;
}

async function uploadBrandAsset(fd: FormData, kind: "logo" | "favicon") {
  const user = await requireCmsUser();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    redirect("/admin-wikis/settings?error=" + encodeURIComponent("Choose an image to upload."));
  }
  if (!brandImages.includes(file.type)) {
    redirect("/admin-wikis/settings?error=" + encodeURIComponent("Use PNG, JPG, WebP or AVIF."));
  }
  const max = kind === "favicon" ? 1024 * 1024 : 3 * 1024 * 1024;
  if (file.size > max) {
    redirect("/admin-wikis/settings?error=" + encodeURIComponent(kind === "favicon" ? "Favicon must be 1 MB or smaller." : "Logo must be 3 MB or smaller."));
  }
  const s = await createClient();
  const path = `brand/${kind}/${user.id}/${crypto.randomUUID()}-${safeAssetName(file.name)}`;
  const { error: uploadError } = await s.storage.from("portfolio-public").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    redirect("/admin-wikis/settings?error=" + encodeURIComponent("Could not upload the image: " + uploadError.message));
  }
  const publicUrl = s.storage.from("portfolio-public").getPublicUrl(path).data.publicUrl;
  const column = kind === "logo" ? "logo_url" : "favicon_url";
  const { error: updateError } = await s
    .from("site_settings")
    .upsert({ singleton_key: "default", [column]: publicUrl, updated_at: new Date().toISOString() }, { onConflict: "singleton_key" });
  if (updateError) {
    await s.storage.from("portfolio-public").remove([path]);
    redirect("/admin-wikis/settings?error=" + encodeURIComponent("Site settings could not be updated with uploaded asset."));
  }
  await s.from("activity_logs").insert({ user_id: user.id, action: kind === "logo" ? "Site logo updated" : "Site favicon updated", entity_type: "site_settings", metadata: { kind } });
  refreshSite();
  redirect("/admin-wikis/settings?saved=true");
}

const siteSchema = z.object({
  professionalName: z.string().trim().min(1).max(120).default("Okoh Wisdom"),
  brandName: z.string().trim().min(1).max(120).default("Wikis Tech"),
  navBrandName: z.string().trim().max(40).default("WIKIS TECH"),
  tagline: z.string().trim().max(250).default("Building digital products that MOVE."),
  location: z.string().trim().max(120).default("Lagos, Nigeria"),
  availabilityMessage: z.string().trim().max(250).default("Available for select freelance contracts & advisory."),
  siteUrl: z.string().trim().max(300).default("https://wisdom-port-kappa.vercel.app"),
  contactEmail: z.string().trim().max(254).default("wikistech07@gmail.com"),
  whatsapp: z.string().trim().max(50).default(""),
  logoUrl: z.string().trim().max(500).default(""),
  faviconUrl: z.string().trim().max(500).default(""),
  resumeUrl: z.string().trim().max(500).default(""),
  copyrightText: z.string().trim().max(200).default(""),
  footerTagline: z.string().trim().max(200).default(""),
  defaultCtaLabel: z.string().trim().max(80).default("Let's Talk"),
  defaultCtaUrl: z.string().trim().max(300).default("/contact"),
  availabilityEnabled: z.boolean().default(true),
});

const socialSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
  username: z.string().trim().max(100),
  sortOrder: z.coerce.number().int().min(-10000).max(10000),
  enabled: z.boolean(),
});

function refreshSite() {
  for (const path of [
    "/",
    "/work",
    "/about",
    "/archive",
    "/lab",
    "/services",
    "/pricing",
    "/contact",
    "/quote",
    "/sitemap.xml",
    "/robots.txt",
    "/admin-wikis/settings",
  ]) {
    revalidatePath(path);
  }
}

export async function saveSiteSettings(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const s = await createClient();
  const p = siteSchema.safeParse({
    professionalName: String(fd.get("professionalName") ?? "Okoh Wisdom"),
    brandName: String(fd.get("brandName") ?? "Wikis Tech"),
    navBrandName: String(fd.get("navBrandName") ?? "WIKIS TECH"),
    tagline: String(fd.get("tagline") ?? ""),
    location: String(fd.get("location") ?? ""),
    availabilityMessage: String(fd.get("availabilityMessage") ?? ""),
    siteUrl: String(fd.get("siteUrl") ?? "https://wisdom-port-kappa.vercel.app"),
    contactEmail: String(fd.get("contactEmail") ?? ""),
    whatsapp: String(fd.get("whatsapp") ?? ""),
    logoUrl: String(fd.get("logoUrl") ?? ""),
    faviconUrl: String(fd.get("faviconUrl") ?? ""),
    resumeUrl: String(fd.get("resumeUrl") ?? ""),
    copyrightText: String(fd.get("copyrightText") ?? ""),
    footerTagline: String(fd.get("footerTagline") ?? ""),
    defaultCtaLabel: String(fd.get("defaultCtaLabel") ?? "Let's Talk"),
    defaultCtaUrl: String(fd.get("defaultCtaUrl") ?? "/contact"),
    availabilityEnabled: fd.get("availabilityEnabled") === "on",
  });

  if (!p.success) {
    const errorMsg = p.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(errorMsg)}`);
  }

  const v = p.data;

  try {
    const { error } = await s
      .from("site_settings")
      .upsert(
        {
          singleton_key: "default",
          professional_name: v.professionalName,
          brand_name: v.brandName,
          nav_brand_name: v.navBrandName,
          tagline: v.tagline || null,
          location: v.location || null,
          availability_enabled: v.availabilityEnabled,
          availability_message: v.availabilityMessage || null,
          site_url: v.siteUrl,
          contact_email: v.contactEmail || null,
          whatsapp: v.whatsapp || null,
          logo_url: v.logoUrl || null,
          favicon_url: v.faviconUrl || null,
          resume_url: v.resumeUrl || null,
          copyright_text: v.copyrightText || null,
          footer_tagline: v.footerTagline,
          default_cta_label: v.defaultCtaLabel,
          default_cta_url: v.defaultCtaUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "singleton_key" },
      );

    if (error) {
      redirect(`/admin-wikis/settings?error=${encodeURIComponent(error.message)}`);
    }

    try {
      await s.from("activity_logs").insert({
        user_id: user.id,
        action: "Global site settings updated",
        entity_type: "site_settings",
      });
    } catch {
      // Non-fatal
    }

    refreshSite();
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(err?.message || "Could not save settings.")}`);
  }

  redirect("/admin-wikis/settings?saved=true");
}

function parseSocial(fd: FormData) {
  const p = socialSchema.safeParse({
    platform: String(fd.get("platform") ?? "").trim(),
    label: String(fd.get("label") ?? "").trim(),
    url: String(fd.get("url") ?? "").trim(),
    username: String(fd.get("username") ?? ""),
    sortOrder: Number(fd.get("sortOrder") || 0),
    enabled: fd.get("enabled") === "on",
  });
  return p;
}

export async function createSocial(fd: FormData) {
  const user = await requireCmsUser();
  const s = await createClient();
  const p = parseSocial(fd);
  if (!p.success) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent("Social link details are invalid.")}`);
  }
  const v = p.data;
  const { error } = await s.from("social_links").insert({
    platform: v.platform,
    label: v.label,
    url: v.url,
    username: v.username || null,
    enabled: v.enabled,
    sort_order: v.sortOrder,
    created_by: user.id,
    updated_by: user.id,
  });
  if (error) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(error.code === "23505" ? "That social link already exists." : error.message)}`);
  }
  await s.from("activity_logs").insert({ user_id: user.id, action: "Social link created", entity_type: "social" });
  refreshSite();
  redirect("/admin-wikis/settings?saved=true");
}

export async function saveSocial(fd: FormData) {
  const user = await requireCmsUser();
  const s = await createClient();
  const p = parseSocial(fd);
  if (!p.success) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent("Social link details are invalid.")}`);
  }
  const v = p.data;
  const id = String(fd.get("id"));
  const { error } = await s.from("social_links").update({
    platform: v.platform,
    label: v.label,
    url: v.url,
    username: v.username || null,
    enabled: v.enabled,
    sort_order: v.sortOrder,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(error.message)}`);
  }
  await s.from("activity_logs").insert({ user_id: user.id, action: "Social link updated", entity_type: "social", entity_id: id });
  refreshSite();
  redirect("/admin-wikis/settings?saved=true");
}

export async function deleteSocial(fd: FormData) {
  const user = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  const { error } = await s.from("social_links").delete().eq("id", id);
  if (error) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(error.message)}`);
  }
  await s.from("activity_logs").insert({ user_id: user.id, action: "Social link deleted", entity_type: "social", entity_id: id });
  refreshSite();
  redirect("/admin-wikis/settings?saved=true");
}

export async function saveAnalytics(fd: FormData) {
  const user = await requireCmsUser();
  const s = await createClient();
  const provider = String(fd.get("provider") ?? "none");
  const enabled = fd.get("enabled") === "on";
  const measurement = String(fd.get("measurementId") ?? "").trim().toUpperCase();

  const { error } = await s
    .from("analytics_settings")
    .upsert(
      {
        singleton_key: "default",
        enabled,
        provider,
        measurement_id: provider === "none" ? null : measurement || null,
        external_click_tracking: fd.get("externalClicks") === "on",
        conversion_tracking: fd.get("conversions") === "on",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "singleton_key" },
    );

  if (error) {
    redirect(`/admin-wikis/settings?error=${encodeURIComponent(error.message)}`);
  }
  await s.from("activity_logs").insert({ user_id: user.id, action: "Analytics configuration updated", entity_type: "analytics", metadata: { enabled, provider } });
  refreshSite();
  redirect("/admin-wikis/settings?saved=true");
}

export async function uploadLogo(fd: FormData) {
  await uploadBrandAsset(fd, "logo");
}

export async function uploadFavicon(fd: FormData) {
  await uploadBrandAsset(fd, "favicon");
}
