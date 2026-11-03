"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCmsUser } from "@/lib/auth/require-cms-user";
import { createClient } from "@/lib/supabase/server";
import { blockSchema, projectSchema } from "@/features/projects/validation";

const checked = (fd: FormData, key: string) => fd.get(key) === "on";
const text = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s || null;
};
const projectImages = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function safeMediaName(name: string) {
  const parts = name.toLowerCase().split(".");
  const ext = parts.length > 1 ? parts.pop()!.replace(/[^a-z0-9]/g, "") : "jpg";
  const base = parts.join(".").replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "project";
  return `${base}.${ext}`;
}

function parsedProject(fd: FormData) {
  return projectSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    shortDescription: text(fd.get("shortDescription")) ?? undefined,
    problem: text(fd.get("problem")) ?? undefined,
    solution: text(fd.get("solution")) ?? undefined,
    whyItMattered: text(fd.get("whyItMattered")) ?? undefined,
    outcome: text(fd.get("outcome")) ?? undefined,
    year: fd.get("year") ? fd.get("year") : undefined,
    client: text(fd.get("client")) ?? undefined,
    role: text(fd.get("role")) ?? undefined,
    status: fd.get("status") || "live",
    visibility: fd.get("visibility") || "public",
    featured: checked(fd, "featured"),
    confidential: checked(fd, "confidential"),
    liveUrl: String(fd.get("liveUrl") ?? "").trim(),
    githubUrl: String(fd.get("githubUrl") ?? "").trim(),
    seoTitle: text(fd.get("seoTitle")) ?? undefined,
    seoDescription: text(fd.get("seoDescription")) ?? undefined,
    seoImageUrl: String(fd.get("seoImageUrl") ?? "").trim(),
    seoNoindex: checked(fd, "seoNoindex"),
  });
}

function projectPayload(v: ReturnType<typeof projectSchema.parse>) {
  return {
    title: v.title,
    slug: v.slug,
    short_description: v.shortDescription ?? null,
    problem: v.problem ?? null,
    solution: v.solution ?? null,
    why_it_mattered: v.whyItMattered ?? null,
    outcome: v.outcome ?? null,
    year: v.year ?? null,
    client: v.client ?? null,
    role: v.role ?? null,
    status: v.status,
    visibility: v.visibility,
    featured: v.featured,
    confidential: v.confidential,
    live_url: v.liveUrl || null,
    github_url: v.githubUrl || null,
    seo_title: v.seoTitle ?? null,
    seo_description: v.seoDescription ?? null,
    seo_image_url: v.seoImageUrl || null,
    seo_noindex: v.seoNoindex,
  };
}

async function persistProject(fd: FormData, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const id = String(fd.get("id"));
  const parsed = parsedProject(fd);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin-wikis/projects/${id}?error=${encodeURIComponent(errorMsg)}`);
  }
  const v = parsed.data;
  const { error } = await supabase
    .from("projects")
    .update({
      ...projectPayload(v),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin-wikis/projects/${id}?error=${encodeURIComponent("Database error: " + error.message)}`);
  }

  await supabase.from("project_category_links").delete().eq("project_id", id);
  const categories = fd.getAll("categories").map(String);
  if (categories.length) {
    await supabase.from("project_category_links").insert(categories.map((category_id) => ({ project_id: id, category_id })));
  }
  return { id, v };
}

export async function createProject(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const parsed = parsedProject(fd);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin-wikis/projects/new?error=${encodeURIComponent(errorMsg)}`);
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...projectPayload(v),
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "Project slug already exists. Please choose a unique slug." : error.message;
    redirect(`/admin-wikis/projects/new?error=${encodeURIComponent(msg)}`);
  }

  const categories = fd.getAll("categories").map(String);
  if (categories.length) {
    await supabase.from("project_category_links").insert(categories.map((category_id) => ({ project_id: data.id, category_id })));
  }

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "Project created",
    entity_type: "project",
    entity_id: data.id,
    metadata: { title: v.title },
  });

  revalidatePath("/admin-wikis/projects");
  revalidatePath("/work");
  revalidatePath("/");
  redirect(`/admin-wikis/projects/${data.id}?created=true`);
}

export async function updateProject(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const supabase = await createClient();
  const { id } = await persistProject(fd, user.id, supabase);

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "Project draft saved",
    entity_type: "project",
    entity_id: id,
  });

  revalidatePath(`/admin-wikis/projects/${id}`);
  revalidatePath("/admin-wikis/projects");
  revalidatePath("/work");
  revalidatePath("/");
  redirect(`/admin-wikis/projects/${id}?saved=true`);
}

export async function addBlock(fd: FormData) {
  await requireCmsUser();
  const projectId = String(fd.get("projectId"));
  const parsed = blockSchema.safeParse({ blockType: fd.get("blockType"), content: String(fd.get("content") ?? "") });
  if (!parsed.success) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Block details are invalid.")}`);
  }

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("project_blocks")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("project_blocks").insert({
    project_id: projectId,
    block_type: parsed.data.blockType,
    sort_order: (last?.sort_order ?? -1) + 1,
    data: parsed.data.blockType === "spacer" ? {} : { content: parsed.data.content },
  });

  revalidatePath(`/admin-wikis/projects/${projectId}`);
  redirect(`/admin-wikis/projects/${projectId}?saved=true`);
}

export async function deleteBlock(fd: FormData) {
  await requireCmsUser();
  const supabase = await createClient();
  const projectId = String(fd.get("projectId"));
  await supabase.from("project_blocks").delete().eq("id", String(fd.get("blockId")));
  revalidatePath(`/admin-wikis/projects/${projectId}`);
  redirect(`/admin-wikis/projects/${projectId}?saved=true`);
}

export async function publishProject(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const supabase = await createClient();
  let id = String(fd.get("id"));

  if (fd.has("title")) {
    const saved = await persistProject(fd, user.id, supabase);
    id = saved.id;
  }

  const [{ data: project }, { data: blocks }, { data: links }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase.from("project_blocks").select("id,block_type,sort_order,data,is_visible").eq("project_id", id).order("sort_order"),
    supabase.from("project_category_links").select("category_id,project_categories(name,slug)").eq("project_id", id),
  ]);

  if (!project) {
    redirect(`/admin-wikis/projects?error=${encodeURIComponent("Project not found.")}`);
  }

  let cardMediaUrl: string | null = null;
  let heroMediaUrl: string | null = null;
  if (project.card_media_id || project.hero_media_id) {
    const ids = [project.card_media_id, project.hero_media_id].filter(Boolean);
    const { data: mediaRows } = await supabase.from("media_library").select("id,storage_bucket,storage_path").in("id", ids);
    const urlFor = (mid: string | null) => {
      const row = mediaRows?.find((m) => m.id === mid);
      return row ? supabase.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data.publicUrl : null;
    };
    cardMediaUrl = urlFor(project.card_media_id);
    heroMediaUrl = urlFor(project.hero_media_id);
  }

  const snapshot = {
    title: project.title,
    slug: project.slug,
    short_description: project.short_description,
    problem: project.problem || "Initial architectural assessment and challenge definition.",
    solution: project.solution || "Full-stack software engineering and user experience implementation.",
    why_it_mattered: project.why_it_mattered || "Delivered operational velocity, user engagement, and strategic positioning.",
    outcome: project.outcome || "Production deployment and positive user feedback.",
    year: project.year,
    client: project.client,
    role: project.role,
    status: project.status,
    confidential: project.confidential,
    live_url: project.confidential ? null : project.live_url,
    github_url: project.confidential ? null : project.github_url,
    card_media_url: cardMediaUrl,
    hero_media_url: heroMediaUrl,
    seo_title: project.seo_title,
    seo_description: project.seo_description,
    seo_image_url: project.seo_image_url,
    seo_noindex: project.seo_noindex,
    categories: links ?? [],
    blocks: (blocks ?? []).filter((x) => x.is_visible),
  };

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      content_state: "published",
      published_snapshot: snapshot,
      published_at: now,
      updated_by: user.id,
      updated_at: now,
    })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin-wikis/projects/${id}?error=${encodeURIComponent("Could not publish: " + updateError.message)}`);
  }

  if (project.visibility === "public") {
    const { error: publicationError } = await supabase.from("project_publications").upsert(
      {
        project_id: id,
        slug: project.slug,
        title: project.title,
        short_description: project.short_description,
        status: project.status,
        featured: project.featured,
        sort_order: project.sort_order,
        confidential: project.confidential,
        snapshot,
        published_at: now,
        updated_at: now,
      },
      { onConflict: "project_id" },
    );

    if (publicationError) {
      redirect(`/admin-wikis/projects/${id}?error=${encodeURIComponent("Published draft, but public publication failed: " + publicationError.message)}`);
    }
  } else {
    await supabase.from("project_publications").delete().eq("project_id", id);
  }

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "Project published",
    entity_type: "project",
    entity_id: id,
    metadata: { featured: project.featured, visibility: project.visibility },
  });

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath(`/work/${project.slug}`);
  revalidatePath(`/admin-wikis/projects/${id}`);
  redirect(`/admin-wikis/projects/${id}?published=true`);
}

export async function moveProjectToTrash(fd: FormData) {
  const user = await requireCmsUser();
  const supabase = await createClient();
  const id = String(fd.get("id"));
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  await supabase.from("project_publications").delete().eq("project_id", id);
  await supabase.from("activity_logs").insert({ user_id: user.id, action: "Project moved to Trash", entity_type: "project", entity_id: id });
  revalidatePath("/");
  revalidatePath("/work");
  redirect("/admin-wikis/projects?saved=true");
}

export async function uploadProjectMedia(fd: FormData) {
  let user;
  try {
    user = await requireCmsUser();
  } catch {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Session expired. Please sign in again."));
  }

  const projectId = String(fd.get("projectId"));
  const kind = String(fd.get("kind"));
  const file = fd.get("file");

  if (!["card", "hero"].includes(kind)) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Unknown project image type.")}`);
  }
  if (!(file instanceof File) || file.size <= 0) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Choose an image file to upload.")}`);
  }
  if (!projectImages.includes(file.type)) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Use PNG, JPG, WebP, or AVIF image format.")}`);
  }
  if (file.size > 8 * 1024 * 1024) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Project images must be 8 MB or smaller.")}`);
  }

  const s = await createClient();
  const path = `projects/${projectId}/${kind}/${crypto.randomUUID()}-${safeMediaName(file.name)}`;

  const { error: uploadError } = await s.storage.from("portfolio-public").upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Storage upload error: " + uploadError.message + ". Run the Recommended SQL in Supabase to ensure storage buckets exist.")}`);
  }

  const { data: media, error: mediaError } = await s
    .from("media_library")
    .insert({
      storage_bucket: "portfolio-public",
      storage_path: path,
      original_name: file.name,
      display_name: file.name,
      mime_type: file.type,
      byte_size: file.size,
      alt_text: kind === "card" ? "Project preview image" : "Project hero image",
      category: "Projects",
      visibility: "public",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (mediaError) {
    await s.storage.from("portfolio-public").remove([path]);
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Media record could not be saved: " + mediaError.message)}`);
  }

  const column = kind === "card" ? "card_media_id" : "hero_media_id";
  const { error: updateError } = await s
    .from("projects")
    .update({ [column]: media.id, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (updateError) {
    redirect(`/admin-wikis/projects/${projectId}?error=${encodeURIComponent("Image uploaded but could not attach to project: " + updateError.message)}`);
  }

  await s.from("activity_logs").insert({
    user_id: user.id,
    action: kind === "card" ? "Project preview image updated" : "Project hero image updated",
    entity_type: "project",
    entity_id: projectId,
  });

  revalidatePath(`/admin-wikis/projects/${projectId}`);
  revalidatePath("/work");
  revalidatePath("/");
  redirect(`/admin-wikis/projects/${projectId}?saved=true`);
}
