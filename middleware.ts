import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, decodeSession } from "@/lib/local-auth";
import { isSupabaseConfigured } from "@/lib/mode";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAuth = path.startsWith("/admin") || path.startsWith("/team");

  if (!isSupabaseConfigured()) {
    if (!needsAuth) return NextResponse.next();

    const session = await decodeSession(request.cookies.get(COOKIE_NAME)?.value);
    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/admin") && session.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = session.role === "team" ? "/team" : "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/team") && session.role !== "team" && session.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/team/:path*", "/login"]
};
