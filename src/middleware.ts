import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// Public routes that don't require authentication
// ============================================
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/shop",
  "/about",
  "/contact",
  "/community",
];

// ============================================
// Role-based route access
// ============================================
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/dashboard", "/ai", "/users", "/products", "/categories", "/customers", "/orders", "/inventory", "/warehouse", "/procurement", "/suppliers", "/sales", "/export", "/import", "/shipments", "/quality-control", "/processing", "/finance", "/analytics", "/reports", "/notifications", "/settings", "/companies"],
  MANAGER: ["/dashboard", "/ai", "/products", "/categories", "/customers", "/orders", "/inventory", "/warehouse", "/procurement", "/suppliers", "/sales", "/export", "/import", "/shipments", "/quality-control", "/processing", "/finance", "/analytics", "/reports", "/notifications"],
  SALES: ["/dashboard", "/ai", "/products", "/customers", "/orders", "/sales", "/notifications"],
  CUSTOMER: ["/customer", "/shop", "/about", "/contact"],
};

// ============================================
// Middleware
// ============================================
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get auth token from cookie
  const authToken = request.cookies.get("auth_token")?.value;

  // If trying to access a protected route without auth, redirect to login
  if (!isPublicRoute && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login/register while authenticated, redirect to appropriate page
  if (authToken && (pathname === "/login" || pathname === "/register")) {
    const userRole = request.cookies.get("user_role")?.value;
    if (userRole === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based access control for protected routes
  if (authToken && !isPublicRoute) {
    const userRole = request.cookies.get("user_role")?.value;

    if (userRole && ROLE_ROUTES[userRole]) {
      const allowedRoutes = ROLE_ROUTES[userRole];

      const isAllowed = allowedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      // Customer trying to access admin routes
      if (!isAllowed && userRole === "CUSTOMER") {
        return NextResponse.redirect(new URL("/customer", request.url));
      }

      // Admin/Manager/Sales trying to access customer routes
      if (!isAllowed && userRole !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

// ============================================
// Matcher
// ============================================
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
