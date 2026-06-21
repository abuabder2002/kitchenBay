import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { getAdminEmails } from "./lib/adminEmails";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/products(.*)",
  "/story(.*)",
  "/blog(.*)",
  "/Kitchenbays(.*)",
  "/contact(.*)",
  "/collections(.*)",
  "/privacy-policy(.*)",
  "/terms-of-use(.*)",
  "/shipping-policy(.*)",
  "/track(.*)",
  "/cart(.*)",
  "/wishlist(.*)",
  "/gift-concierge(.*)",
  "/api/content(.*)",
  "/faq(.*)",
  "/returns-refunds(.*)",
  "/api/videos(.*)",
  "/api/send-email(.*)",
  "/api/bulk-inquiries(.*)",
  "/api/products(.*)",
  // Category & subcategory reads — used by product dropdowns on all pages
  "/api/admin/categories",
  "/api/admin/subcategories",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. If it's an admin route, check authentication and email configuration
  if (isAdminRoute(request)) {
    const session = await auth();

    // If not signed in, redirect to login page
    if (!session.userId) {
      await auth.protect();
      return;
    }

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(session.userId);
      const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;

      const adminEmails = getAdminEmails();

      if (!email || !adminEmails.includes(email.toLowerCase())) {
        // Redirect non-admin users away from /admin to the home page "/"
        return Response.redirect(new URL("/", request.url));
      }
    } catch (e) {
      console.error("Admin check failed in middleware:", e);
      // Safety redirect to home page
      return Response.redirect(new URL("/", request.url));
    }
  } else {
    // 2. Protect non-public routes (e.g. checkout, orders)
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
