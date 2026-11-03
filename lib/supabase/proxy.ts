import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  const pathname = request.nextUrl.pathname;
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith("sb-"));

  // Fast path: skip expensive claims check if user is on login page or has no supabase cookies
  if (!hasAuthCookie || pathname.startsWith("/admin-wikis/login")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: options?.signal || AbortSignal.timeout(3000),
          });
        },
      },
    },
  );

  try {
    await supabase.auth.getClaims();
  } catch {
    // Session token claims check failure should not block the response
  }

  return response;
}
