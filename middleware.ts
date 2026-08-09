import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  verifyAuthToken,
} from "@/app/lib/auth";

/**
 * Routes that must remain accessible without authentication.
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname === "/favicon.ico"
  );
}

/**
 * API calls should receive JSON 401 rather than an HTML redirect.
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Login itself must remain accessible.
   */
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let authenticated = false;

  try {
    authenticated = await verifyAuthToken(token);
  } catch (error) {
    console.error("Authentication middleware error:", error);
    authenticated = false;
  }

  /*
   * Authenticated users may continue.
   */
  if (authenticated) {
    const response = NextResponse.next();

    // Avoid caching authenticated content in shared caches.
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    // Don't allow search engines to index the application.
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );

    return response;
  }

  /*
   * API routes should NOT redirect to /login because your frontend
   * expects JSON responses from them.
   */
  if (isApiRoute(pathname)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  /*
   * Browser page request:
   * redirect before the protected page is rendered.
   */
  const loginUrl = new URL("/login", request.url);

  return NextResponse.redirect(loginUrl);
}

/*
 * Run middleware on application/API requests while allowing Next's
 * internal static assets through so the login screen itself can render.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};