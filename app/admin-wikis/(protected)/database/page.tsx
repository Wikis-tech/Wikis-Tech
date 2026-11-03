import { DatabaseHubClient } from "@/components/admin/database-hub-client";
import { testSupabaseHandshake } from "./actions";
import { getSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDatabasePage() {
  const env = getSupabaseEnv();
  const currentUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey =
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "placeholder-key";

  // Run initial handshake check server-side
  const initialHandshake = await testSupabaseHandshake();

  return (
    <main className="mx-auto max-w-[1400px]">
      <DatabaseHubClient
        currentUrl={currentUrl}
        hasAnonKey={hasAnonKey}
        initialHandshake={initialHandshake}
      />
    </main>
  );
}
