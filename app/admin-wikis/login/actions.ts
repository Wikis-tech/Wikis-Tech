"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";
import fs from "node:fs/promises";
import path from "node:path";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin-wikis/login?error=missing");
  }

  const env = getSupabaseEnv();
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key || key === "placeholder-key") {
    redirect("/admin-wikis/login?error=no_api_key");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect(`/admin-wikis/login?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.user) {
      redirect("/admin-wikis/login?error=no_user");
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    const msg = err?.message || "Authentication failed. Check your Supabase connection.";
    redirect(`/admin-wikis/login?error=${encodeURIComponent(msg)}`);
  }

  redirect("/admin-wikis");
}

export async function saveAnonKeyFromLogin(formData: FormData) {
  const anonKey = String(formData.get("anonKey") ?? "").trim();

  if (!anonKey || anonKey.length < 20) {
    redirect("/admin-wikis/login?error=" + encodeURIComponent("Invalid key: The Supabase anon key is usually a long JWT starting with eyJhbGci..."));
  }

  const env = getSupabaseEnv();
  const customUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://mgzvfhrnrrvbmajkrmgp.supabase.co";

  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${customUrl}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${anonKey}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

  await fs.writeFile(envPath, envContent, "utf8");

  process.env.NEXT_PUBLIC_SUPABASE_URL = customUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = anonKey;

  revalidatePath("/admin-wikis/login");
  revalidatePath("/admin-wikis/sql");
  revalidatePath("/admin-wikis");
  revalidatePath("/");

  redirect("/admin-wikis/login?key_saved=true");
}
