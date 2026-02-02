import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_KEY } from "./constants";

const protectedRoutes = [
  "/dashboard",
  "/kyc",
  "/categories",
  "/creators",
  "/videos",
  "/featured",
  "/transactions",
  "/devices",
  "/notifications",
  "/payouts",
  "/settings",
];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute) {
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kyc/:path*",
    "/categories/:path*",
    "/creators/:path*",
    "/videos/:path*",
    "/featured/:path*",
    "/transactions/:path*",
    "/devices/:path*",
    "/notifications/:path*",
    "/payouts/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
