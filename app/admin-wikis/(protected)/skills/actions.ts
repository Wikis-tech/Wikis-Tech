"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

export async function createSkill(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const name = String(fd.get("name") ?? "").trim();
  const groupName = String(fd.get("group") ?? "Build").trim();
  const sortOrder = Number(fd.get("sortOrder") || 0);
  const isVisible = fd.get("visible") === "on";

  if (!name) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent("Skill name is required."));
  }

  const s = await createClient();
  const { error } = await s.from("skills").insert({
    name,
    group_name: groupName,
    sort_order: sortOrder,
    is_visible: isVisible,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    const msg = error.code === "23505" ? "A skill with this name already exists in this group." : error.message;
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(msg));
  }

  try {
    await s.from("activity_logs").insert({
      user_id: user.id,
      action: "Skill added",
      entity_type: "skill",
      metadata: { name, group: groupName },
    });
  } catch {}

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}

export async function saveSkill(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim();
  const groupName = String(fd.get("group") ?? "Build").trim();
  const sortOrder = Number(fd.get("sortOrder") || 0);
  const isVisible = fd.get("visible") === "on";

  if (!name) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent("Skill name is required."));
  }

  const s = await createClient();
  const { error } = await s
    .from("skills")
    .update({
      name,
      group_name: groupName,
      sort_order: sortOrder,
      is_visible: isVisible,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}

export async function deleteSkill(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const s = await createClient();
  const { error } = await s.from("skills").delete().eq("id", id);

  if (error) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(error.message));
  }

  try {
    await s.from("activity_logs").insert({
      user_id: user.id,
      action: "Skill removed",
      entity_type: "skill",
      entity_id: id,
    });
  } catch {}

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}

export async function createTechnology(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const name = String(fd.get("name") ?? "").trim();
  const category = String(fd.get("category") ?? "Frontend").trim();
  const iconUrl = String(fd.get("iconUrl") ?? "").trim() || null;
  const websiteUrl = String(fd.get("websiteUrl") ?? "").trim() || null;
  const sortOrder = Number(fd.get("sortOrder") || 0);
  const isVisible = fd.get("visible") === "on";

  if (!name) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent("Tool / Technology name is required."));
  }

  const s = await createClient();
  const { error } = await s.from("technologies").insert({
    name,
    category,
    icon_url: iconUrl,
    website_url: websiteUrl,
    sort_order: sortOrder,
    is_visible: isVisible,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    const msg = error.code === "23505" ? "A technology with this name already exists." : error.message;
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(msg));
  }

  try {
    await s.from("activity_logs").insert({
      user_id: user.id,
      action: "Technology added",
      entity_type: "technology",
      metadata: { name, category },
    });
  } catch {}

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}

export async function saveTechnology(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim();
  const category = String(fd.get("category") ?? "Frontend").trim();
  const iconUrl = String(fd.get("iconUrl") ?? "").trim() || null;
  const websiteUrl = String(fd.get("websiteUrl") ?? "").trim() || null;
  const sortOrder = Number(fd.get("sortOrder") || 0);
  const isVisible = fd.get("visible") === "on";

  if (!name) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent("Technology name is required."));
  }

  const s = await createClient();
  const { error } = await s
    .from("technologies")
    .update({
      name,
      category,
      icon_url: iconUrl,
      website_url: websiteUrl,
      sort_order: sortOrder,
      is_visible: isVisible,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}

export async function deleteTechnology(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const s = await createClient();
  const { error } = await s.from("technologies").delete().eq("id", id);

  if (error) {
    redirect("/admin-wikis/skills?error=" + encodeURIComponent(error.message));
  }

  try {
    await s.from("activity_logs").insert({
      user_id: user.id,
      action: "Technology deleted",
      entity_type: "technology",
      entity_id: id,
    });
  } catch {}

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin-wikis/skills");
  redirect("/admin-wikis/skills?saved=true");
}