import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "@/utils/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const client = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      },
    },
  });
  const hasSessionCookie = request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
  const claims = hasSessionCookie ? (await client.auth.getClaims()).data?.claims : null;
  if (request.nextUrl.pathname === "/mypage" && !claims?.sub) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    for (const cookie of response.cookies.getAll()) redirectResponse.cookies.set(cookie);
    redirectResponse.headers.set("Cache-Control", "private, no-store");
    return redirectResponse;
  }
  return response;
}

export const config = { matcher: ["/", "/signup", "/login", "/mypage"] };
