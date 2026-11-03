"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";
import { experimentInput } from "@/features/phase6/validation";

const arr = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

function parse(fd: FormData) {
  const result = experimentInput.safeParse({
    title: String(fd.get("title") ?? "").trim() || "Untitled Experiment",
    slug: String(fd.get("slug") ?? "").trim() || "experiment-" + Date.now(),
    description: String(fd.get("description") ?? "").trim(),
    status: fd.get("status") || "in_progress",
    visibility: fd.get("visibility") || "public",
    technology: arr(fd.get("technology")),
    imageUrl: String(fd.get("imageUrl") ?? "").trim(),
    videoUrl: String(fd.get("videoUrl") ?? "").trim(),
    githubUrl: String(fd.get("githubUrl") ?? "").trim(),
    demoUrl: String(fd.get("demoUrl") ?? "").trim(),
    date: String(fd.get("date") ?? "").trim(),
    caseStudy: String(fd.get("caseStudy") ?? "").trim(),
    sortOrder: Number(fd.get("sortOrder") || 0),
    featured: fd.get("featured") === "on",
    seoTitle: String(fd.get("seoTitle") ?? "").trim(),
    seoDescription: String(fd.get("seoDescription") ?? "").trim(),
    seoImageUrl: String(fd.get("seoImageUrl") ?? "").trim(),
    seoNoindex: fd.get("seoNoindex") === "on",
  });
  return result;
}

export async function createExperiment(fd: FormData) {
  const u = await requireCmsUser();
  const parsed = parse(fd);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Experiment input is invalid.";
    redirect(`/admin-wikis/lab?error=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data;
  const s = await createClient();
  const { data, error } = await s
    .from("experiments")
    .insert({
      title: v.title,
      slug: v.slug,
      description: v.description || null,
      status: v.status,
      technology: v.technology,
      image_url: v.imageUrl || null,
      video_url: v.videoUrl || null,
      github_url: v.githubUrl || null,
      demo_url: v.demoUrl || null,
      experiment_date: v.date || null,
      case_study: v.caseStudy || null,
      featured: v.featured,
      visibility: v.visibility,
      sort_order: v.sortOrder,
      seo_title: v.seoTitle || null,
      seo_description: v.seoDescription || null,
      seo_image_url: v.seoImageUrl || null,
      seo_noindex: v.seoNoindex,
      created_by: u.id,
      updated_by: u.id,
    })
    .select("id")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "Experiment slug already exists." : error.message;
    redirect(`/admin-wikis/lab?error=${encodeURIComponent(msg)}`);
  }

  await s.from("activity_logs").insert({
    user_id: u.id,
    action: "Experiment created",
    entity_type: "experiment",
    entity_id: data.id,
  });

  revalidatePath("/lab");
  revalidatePath("/");
  redirect(`/admin-wikis/lab/${data.id}?saved=true`);
}

export async function saveExperiment(fd: FormData) {
  const u = await requireCmsUser();
  const id = String(fd.get("id"));
  const parsed = parse(fd);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Experiment input is invalid.";
    redirect(`/admin-wikis/lab/${id}?error=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data;
  const s = await createClient();
  const { error } = await s
    .from("experiments")
    .update({
      title: v.title,
      slug: v.slug,
      description: v.description || null,
      status: v.status,
      technology: v.technology,
      image_url: v.imageUrl || null,
      video_url: v.videoUrl || null,
      github_url: v.githubUrl || null,
      demo_url: v.demoUrl || null,
      experiment_date: v.date || null,
      case_study: v.caseStudy || null,
      featured: v.featured,
      visibility: v.visibility,
      sort_order: v.sortOrder,
      seo_title: v.seoTitle || null,
      seo_description: v.seoDescription || null,
      seo_image_url: v.seoImageUrl || null,
      seo_noindex: v.seoNoindex,
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin-wikis/lab/${id}?error=${encodeURIComponent(error.message)}`);
  }

  await s.from("activity_logs").insert({
    user_id: u.id,
    action: "Experiment updated",
    entity_type: "experiment",
    entity_id: id,
  });

  revalidatePath("/lab");
  revalidatePath("/");
  revalidatePath("/admin-wikis/lab");
  revalidatePath(`/admin-wikis/lab/${id}`);
  redirect(`/admin-wikis/lab/${id}?saved=true`);
}

export async function trashExperiment(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  await s
    .from("experiments")
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/lab");
  revalidatePath("/admin-wikis/lab");
  redirect("/admin-wikis/lab?saved=true");
}

export async function saveCraft(fd: FormData) {
  let u;
  try {
    u = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }
  const s = await createClient();
  const clean = (key: string, max: number) =>
    String(fd.get(key) ?? "")
      .trim()
      .slice(0, max);

  const { error } = await s
    .from("craft_settings")
    .upsert(
      {
        singleton_key: "default",
        heading: clean("heading", 40) || "CRAFT",
        message: clean("message", 400),
        context_label: clean("context", 60) || "Context",
        role_label: clean("role", 60) || "Role",
        action_label: clean("action", 60) || "Action",
        format_label: clean("format", 60) || "Format",
        tone_label: clean("tone", 60) || "Tone / Limits",
        usage_items: arr(fd.get("usageItems")).slice(0, 20),
        enabled: fd.get("enabled") === "on",
        updated_by: u.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "singleton_key" },
    );

  if (error) {
    redirect(`/admin-wikis/lab?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/lab");
  revalidatePath("/admin-wikis/lab");
  redirect("/admin-wikis/lab?saved=true");
}