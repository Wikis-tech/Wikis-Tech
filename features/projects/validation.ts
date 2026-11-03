import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Enter a project title.").max(200),
  slug: z.preprocess(
    (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    z
      .string()
      .min(1, "Enter a slug.")
      .max(140)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letters, numbers and hyphens."),
  ),
  shortDescription: optionalText(1000),
  problem: optionalText(10000),
  solution: optionalText(10000),
  whyItMattered: optionalText(10000),
  outcome: optionalText(10000),
  year: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(1990).max(2100).optional(),
  ),
  client: optionalText(200),
  role: optionalText(200),
  status: z.enum([
    "shipped",
    "live",
    "in_development",
    "prototype",
    "experiment",
    "concept",
    "archived",
  ]).default("live"),
  visibility: z.enum(["public", "private"]).default("public"),
  featured: z.boolean().default(false),
  confidential: z.boolean().default(false),
  liveUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  githubUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  seoTitle: optionalText(120),
  seoDescription: optionalText(500),
  seoImageUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  seoNoindex: z.boolean().default(false),
});

export const blockSchema = z.object({
  blockType: z
    .enum([
      "heading",
      "paragraph",
      "image",
      "gallery",
      "video",
      "quote",
      "stats",
      "two_column",
      "full_width_image",
      "technology",
      "before_after",
      "embed",
      "spacer",
      "cta",
    ])
    .default("paragraph"),
  content: z.string().max(25000),
});
