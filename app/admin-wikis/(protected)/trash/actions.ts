"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

const VALID_TABLES = [
  "projects",
  "experiments",
  "services",
  "pricing_packages",
  "designs",
  "testimonials",
] as const;

type ValidTable = (typeof VALID_TABLES)[number];

export async function restoreItem(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const table = String(fd.get("table")) as ValidTable;
  const id = String(fd.get("id"));

  if (!VALID_TABLES.includes(table) || !id) {
    redirect("/admin-wikis/trash?error=" + encodeURIComponent("Invalid resource table or ID."));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({
      deleted_at: null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin-wikis/trash?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: `Restored ${table.replace(/s$/, "")} from Trash`,
      entity_type: table.replace(/s$/, ""),
      entity_id: id,
    });
  } catch {}

  revalidatePath("/admin-wikis/trash");
  revalidatePath("/admin-wikis");
  revalidatePath("/");
  redirect("/admin-wikis/trash?restored=true");
}

export async function permanentlyDeleteItem(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const table = String(fd.get("table")) as ValidTable;
  const id = String(fd.get("id"));

  if (!VALID_TABLES.includes(table) || !id) {
    redirect("/admin-wikis/trash?error=" + encodeURIComponent("Invalid resource table or ID."));
  }

  const supabase = await createClient();

  // If deleting project permanently, clean up publications first
  if (table === "projects") {
    await supabase.from("project_publications").delete().eq("project_id", id);
    await supabase.from("project_blocks").delete().eq("project_id", id);
    await supabase.from("project_category_links").delete().eq("project_id", id);
  }

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    redirect(`/admin-wikis/trash?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: `Permanently deleted ${table.replace(/s$/, "")}`,
      entity_type: table.replace(/s$/, ""),
      entity_id: id,
    });
  } catch {}

  revalidatePath("/admin-wikis/trash");
  revalidatePath("/admin-wikis");
  redirect("/admin-wikis/trash?deleted=true");
}
