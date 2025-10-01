import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/api/auth",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/public")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });
  
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const preferred = req.cookies.get("preferred_org_slug")?.value;
    if (preferred) {
      const url = req.nextUrl.clone();
      url.pathname = `/o/${preferred}`;
      return NextResponse.redirect(url);
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/organizations";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/o/")) {
    const [, , orgSlug] = pathname.split("/");
    if (!orgSlug) {
      const url = req.nextUrl.clone();
      url.pathname = "/organizations";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/organizations")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next|static|public).*)",
  ],
};
