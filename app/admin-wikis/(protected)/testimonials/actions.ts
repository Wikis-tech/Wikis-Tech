"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";

export async function createTestimonial(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const name = String(fd.get("name") ?? "").trim();
  const quote = String(fd.get("quote") ?? "").trim();
  const position = String(fd.get("position") ?? "").trim() || null;
  const company = String(fd.get("company") ?? "").trim() || null;
  const photoUrl = String(fd.get("photoUrl") ?? "").trim() || null;
  const featured = fd.get("featured") === "on";
  const visibility = fd.get("visibility") === "on";
  const sortOrder = Number(fd.get("sortOrder") || 0);

  if (!name || name.length < 2) {
    redirect("/admin-wikis/testimonials?error=" + encodeURIComponent("Client / reviewer name is required."));
  }
  if (!quote || quote.length < 10) {
    redirect("/admin-wikis/testimonials?error=" + encodeURIComponent("Quote must be at least 10 characters long."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert({
    name,
    quote,
    position,
    company,
    photo_url: photoUrl,
    featured,
    visibility,
    sort_order: sortOrder,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect("/admin-wikis/testimonials?error=" + encodeURIComponent(error.message));
  }

  try {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "Testimonial created",
      entity_type: "testimonial",
      metadata: { client: name },
    });
  } catch {}

  revalidatePath("/admin-wikis/testimonials");
  revalidatePath("/");
  redirect("/admin-wikis/testimonials?saved=true");
}

export async function updateTestimonial(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim();
  const quote = String(fd.get("quote") ?? "").trim();
  const position = String(fd.get("position") ?? "").trim() || null;
  const company = String(fd.get("company") ?? "").trim() || null;
  const photoUrl = String(fd.get("photoUrl") ?? "").trim() || null;
  const featured = fd.get("featured") === "on";
  const visibility = fd.get("visibility") === "on";
  const sortOrder = Number(fd.get("sortOrder") || 0);

  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      name,
      quote,
      position,
      company,
      photo_url: photoUrl,
      featured,
      visibility,
      sort_order: sortOrder,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect("/admin-wikis/testimonials?error=" + encodeURIComponent(error.message));
  }

  try {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "Testimonial updated",
      entity_type: "testimonial",
      entity_id: id,
    });
  } catch {}

  revalidatePath("/admin-wikis/testimonials");
  revalidatePath("/");
  redirect("/admin-wikis/testimonials?saved=true");
}

export async function moveTestimonialToTrash(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const id = String(fd.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect("/admin-wikis/testimonials?error=" + encodeURIComponent(error.message));
  }

  try {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "Testimonial moved to Trash",
      entity_type: "testimonial",
      entity_id: id,
    });
  } catch {}

  revalidatePath("/admin-wikis/testimonials");
  revalidatePath("/");
  redirect("/admin-wikis/testimonials?saved=true");
}
