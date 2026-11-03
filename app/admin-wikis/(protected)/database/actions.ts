"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCmsUser } from "@/lib/auth/require-cms-user";

export type HandshakeResult = {
  success: boolean;
  message: string;
  url: string;
  latencyMs: number;
  tablesChecked: Record<string, number | string>;
  authStatus: string;
};

export async function testSupabaseHandshake(): Promise<HandshakeResult> {
  const startTime = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mgzvfhrnrrvbmajkrmgp.supabase.co";

  try {
    const supabase = await createClient();

    // Test multiple core tables that the public site and admin rely on
    const [
      { count: logsCount, error: logsError },
      { count: projectsCount, error: projectsError },
      { count: servicesCount, error: servicesError },
      { count: pricingCount, error: pricingError },
      { count: experimentsCount, error: experimentsError },
      { count: messagesCount, error: messagesError },
      { data: siteData, error: siteError },
      { data: userData, error: userError },
    ] = await Promise.all([
      supabase.from("activity_logs").select("*", { count: "exact", head: true }),
      supabase.from("project_publications").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("pricing_packages").select("*", { count: "exact", head: true }),
      supabase.from("experiments").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      supabase.from("site_settings").select("brand_name,professional_name").limit(1).maybeSingle(),
      supabase.auth.getUser(),
    ]);

    const latencyMs = Date.now() - startTime;

    const tablesChecked: Record<string, number | string> = {
      "activity_logs": logsError ? `Error: ${logsError.message}` : logsCount ?? 0,
      "project_publications": projectsError ? `Error: ${projectsError.message}` : projectsCount ?? 0,
      "services": servicesError ? `Error: ${servicesError.message}` : servicesCount ?? 0,
      "pricing_packages": pricingError ? `Error: ${pricingError.message}` : pricingCount ?? 0,
      "experiments": experimentsError ? `Error: ${experimentsError.message}` : experimentsCount ?? 0,
      "contact_messages": messagesError ? `Error: ${messagesError.message}` : messagesCount ?? 0,
      "site_settings": siteError ? `Error: ${siteError.message}` : siteData?.brand_name || "OK",
    };

    const hasAnyError =
      logsError || projectsError || servicesError || pricingError || experimentsError || siteError;

    return {
      success: !hasAnyError,
      message: hasAnyError
        ? "Connected to endpoint, but some tables returned permission or schema warnings. Please run the Recommended SQL Sync Script."
        : "Supabase handshake confirmed! Database is communicating cleanly with live tables.",
      url,
      latencyMs,
      tablesChecked,
      authStatus: userData?.user ? `Authenticated as ${userData.user.email}` : "Anonymous / CMS Session",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Handshake failed: ${err.message || String(err)}`,
      url,
      latencyMs: Date.now() - startTime,
      tablesChecked: {},
      authStatus: "Disconnected",
    };
  }
}

export async function saveSupabaseAnonKey(formData: FormData) {
  await requireCmsUser();
  const anonKey = String(formData.get("anonKey") || "").trim();
  const customUrl = String(formData.get("supabaseUrl") || "").trim() || "https://mgzvfhrnrrvbmajkrmgp.supabase.co";

  if (!anonKey) {
    throw new Error("Please provide a valid Supabase anon public key.");
  }

  // Update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${customUrl}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${anonKey}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

  await fs.writeFile(envPath, envContent, "utf8");

  // Also update process.env in memory for current worker
  process.env.NEXT_PUBLIC_SUPABASE_URL = customUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = anonKey;

  revalidatePath("/admin-wikis");
  revalidatePath("/admin-wikis/database");
  revalidatePath("/admin-wikis/sql");
  revalidatePath("/admin-wikis/login");
  revalidatePath("/");

  return { success: true, message: "Supabase credentials saved successfully to .env.local!" };
}

export async function getMigrationFileSql(filename: string): Promise<string> {
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), "supabase", "migrations", safeFilename);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    return `-- Error reading migration file ${safeFilename}: ${err}`;
  }
}
