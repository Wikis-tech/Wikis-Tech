"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

const txt = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s || null;
};

const num = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function saveAbout(fd: FormData) {
  let u;
  try {
    u = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const s = await createClient();
  const payload = {
    singleton_key: "default",
    headline: String(fd.get("headline") ?? "").trim() || "Full-Stack Software Engineer & Product Designer",
    introduction: String(fd.get("introduction") ?? "").trim(),
    biography: txt(fd.get("biography")),
    philosophy: txt(fd.get("philosophy")),
    location: txt(fd.get("location")) || "Lagos, Nigeria",
    availability: txt(fd.get("availability")),
    portrait_url: txt(fd.get("portraitUrl")) || "/wikis.png",
    resume_url: txt(fd.get("resumeUrl")),
    is_published: fd.get("published") === "on",
    updated_by: u.id,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await s
      .from("about_profile")
      .upsert(payload, { onConflict: "singleton_key" });

    if (error) {
      console.error("About profile upsert failed", error);
      redirect(`/admin-wikis/about?error=${encodeURIComponent("Supabase Error: " + error.message)}`);
    }

    try {
      await s.from("activity_logs").insert({
        user_id: u.id,
        action: "About profile updated",
        entity_type: "about",
      });
    } catch {
      // Non-fatal
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin-wikis/about");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect(`/admin-wikis/about?error=${encodeURIComponent(err?.message || "Could not save details.")}`);
  }

  redirect("/admin-wikis/about?saved=true");
}

export async function addJourney(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  await s.from("journey_items").insert({
    title: String(fd.get("title") ?? "").trim(),
    description: txt(fd.get("description")),
    date_label: txt(fd.get("dateLabel")),
    icon: txt(fd.get("icon")),
    sort_order: num(fd.get("sortOrder")),
    created_by: u.id,
    updated_by: u.id,
  });
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}

export async function saveJourney(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  await s
    .from("journey_items")
    .update({
      title: String(fd.get("title") ?? "").trim(),
      description: txt(fd.get("description")),
      date_label: txt(fd.get("dateLabel")),
      sort_order: num(fd.get("sortOrder")),
      is_visible: fd.get("visible") === "on",
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}

export async function deleteJourney(fd: FormData) {
  await requireCmsUser();
  const s = await createClient();
  await s.from("journey_items").delete().eq("id", String(fd.get("id")));
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}

export async function addEducation(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  await s.from("education").insert({
    institution: String(fd.get("institution") ?? "").trim(),
    program: txt(fd.get("program")),
    qualification: txt(fd.get("qualification")),
    location: txt(fd.get("location")),
    start_year: fd.get("startYear") ? Number(fd.get("startYear")) : null,
    end_year: fd.get("endYear") ? Number(fd.get("endYear")) : null,
    is_current: fd.get("current") === "on",
    description: txt(fd.get("description")),
    sort_order: num(fd.get("sortOrder")),
    created_by: u.id,
    updated_by: u.id,
  });
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}

export async function saveEducation(fd: FormData) {
  const u = await requireCmsUser();
  const s = await createClient();
  const id = String(fd.get("id"));
  await s
    .from("education")
    .update({
      institution: String(fd.get("institution") ?? "").trim(),
      program: txt(fd.get("program")),
      qualification: txt(fd.get("qualification")),
      location: txt(fd.get("location")),
      start_year: fd.get("startYear") ? Number(fd.get("startYear")) : null,
      end_year: fd.get("endYear") ? Number(fd.get("endYear")) : null,
      is_current: fd.get("current") === "on",
      is_visible: fd.get("visible") === "on",
      description: txt(fd.get("description")),
      sort_order: num(fd.get("sortOrder")),
      updated_by: u.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}

export async function deleteEducation(fd: FormData) {
  await requireCmsUser();
  const s = await createClient();
  await s.from("education").delete().eq("id", String(fd.get("id")));
  revalidatePath("/about");
  revalidatePath("/admin-wikis/about");
  redirect("/admin-wikis/about?saved=true");
}