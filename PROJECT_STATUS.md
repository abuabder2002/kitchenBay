# Project Status: KitchenBay (Artisan Craft)

> **Single Source of Truth** for AI agents, developers, deployment engineers, and future maintainers.

## 1. Project Overview

*   **Project Name:** KitchenBay / Artisan Craft
*   **Business Purpose:** Premium e-commerce storefront for artisan crafts.
*   **Ecommerce Domain:** Retail & Wholesale Handmade Crafts.
*   **Target Users:** B2C (Retail customers) and B2B (Wholesale buyers/distributors).
*   **B2B/B2C Features:** Standard shopping cart/checkout for B2C; Bulk Inquiry system and tailored pricing for B2B.
*   **Current Development Stage:** Late-stage development / Deployment Readiness. Core flows (Auth, Cart, Checkout, Admin) are implemented.

## 2. Tech Stack

*   **Frontend Framework:** Next.js 16.2.4 (App Router) with React 19.2.4.
*   **Styling (CSS):** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom luxury HSL/Hex theme variables.
*   **Backend Architecture:** Next.js API Routes (Serverless) & Server Actions.
*   **Database:** PostgreSQL (Cloud hosted, e.g., Neon).
*   **ORM:** Prisma v7.8.0.
*   **Authentication:** Clerk (`@clerk/nextjs` v7.4.1) for secure session management.
*   **Payment Gateway:** Razorpay (v2.9.6) for Indian local payments (UPI, Cards, NetBanking).
*   **Storage/Image Platform:** Cloudinary (v2.10.0) for optimized media delivery.
*   **Caching/State:** Upstash Redis (`@upstash/redis` v1.38.0) for high-performance caching.
*   **Admin Architecture:** Role-based protected routes (`/admin`) guarded by Next.js Middleware.
*   **State Management:** React Context API (Cart, Wishlist, Auth, Products) using `localStorage` for persistence where needed.
*   **Error Monitoring:** Sentry (`@sentry/nextjs` v10.53.1).

## 3. Current Architecture

*   **Folder Structure:** Visual components and business logic are separated.
    *   `src/app`: Next.js App Router (pages, APIs, layouts).
    *   `src/components`: Reusable UI components (Navbar, Footer, ProductCard).
    *   `src/lib`: Global states (Contexts), Prisma singleton, shared utilities.
    *   `prisma`: Database schema and migrations.
    *   `public`: Static assets (video, brand images).
*   **App Router Structure:**
    *   Public Storefront: `/`, `/products`, `/collections`, `/story`, `/cart`, `/checkout`, `/wishlist`, etc.
    *   Protected Admin: `/admin/*`
    *   API Routes: `/api/*`
*   **Context/Provider Architecture:** Centralized in `src/components/Providers.tsx` which wraps the root layout. Includes Cart, Wishlist, and Auth contexts.
*   **Prisma Architecture:** Centralized `src/lib/prisma.ts` singleton to avoid connection exhaustion in serverless environments.
*   **Clerk Authentication Flow:** Session tokens managed by Clerk. Middleware (`src/middleware.ts`) protects routes.
*   **Role-Based Admin System:** The middleware explicitly checks the authenticated user's email against `NEXT_PUBLIC_ADMIN_EMAIL`. If it matches, they can access `/admin`.
*   **Image Handling System:** Images are uploaded to Cloudinary, URLs are saved in PostgreSQL, and served using Next.js Image component for automatic optimization.

## 4. Database Documentation

Defined in `prisma/schema.prisma`.

*   **Prisma Models:**
    *   `User`: Customers and Admins.
    *   `Address`: User shipping/billing addresses.
    *   `Product`: Catalog items (prices in paise).
    *   `Order` & `OrderItem`: Transaction records.
    *   `TraditionVideo`: Brand story video links.
    *   `Cart` & `CartItem`: Persistent shopping carts.
    *   `Wishlist` & `WishlistItem`: Saved items.
    *   `BulkInquiry` & `BulkInquiryItem`: B2B wholesale requests.
    *   `BulkImportLog`: Audit log for admin CSV/Excel uploads.
*   **Table Relationships:**
    *   User (1) to Many (Orders, Addresses, BulkInquiries).
    *   User (1) to One (Cart, Wishlist).
    *   Order (1) to Many (OrderItems).
    *   Product (1) to Many (OrderItems, CartItems, WishlistItems, BulkInquiryItems).
*   **Important Enums:**
    *   `Role`: `USER`, `ADMIN`.
    *   `OrderStatus`: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
*   **Persistent Storage Systems:** Carts and Wishlists are persisted in the DB for logged-in users, allowing cross-device syncing.
*   **Financial Precision:** All monetary values (prices, totals) are stored as `Int` (Paise - Rupee * 100) to prevent floating-point errors.

## 5. Authentication & Authorization

*   **Clerk Setup:** Standard `@clerk/nextjs` integration using App Router configuration.
*   **Admin Email Protection Logic:** Configured in `src/middleware.ts`. Checks `NEXT_PUBLIC_ADMIN_EMAIL` against the authenticated session email.
*   **Middleware Protection:**
    *   Public routes (e.g., `/`, `/login`, `/products`) bypass auth.
    *   Admin routes (`/admin(.*)`) strictly enforce admin email check.
    *   Other routes (e.g., `/checkout`, `/orders`) require a valid user session.
*   **Session Handling:** Clerk manages JWTs via cookies.

## 6. Completed Features

*   **Ecommerce Features:** Product listing, filtering, search, cart management, checkout flow, wishlist.
*   **Admin Features:** Dashboard, product management, order overview.
*   **Payment Features:** Razorpay integration (order creation and signature verification).
*   **Authentication Features:** Clerk signup/login flows, route protection.
*   **Database Features:** Complete PostgreSQL schema with Prisma ORM.
*   **Bulk Upload Features:** Schema support for `BulkImportLog`.
*   **Bulk Inquiry Features:** B2B forms (`BulkInquiryModal.tsx`), database schema, and `/api/bulk-inquiries` routes.
*   **Design & UI:** Fully overhauled to a Zishta-inspired premium heritage aesthetic. Uses HSL/Hex theme variables (Cream, Deep Brown, Dark Olive Green). Features include a sticky mega-menu, editorial-style Brand Story page, masonry grid PLP with persistent sidebar, and a highly immersive PDP with sticky buy buttons and narrative tabs. Typography uses Playfair Display for headings and Nunito Sans for body.

## 7. Pending / Upcoming Features

*   **Unfinished Tasks:** Full integration testing of edge cases in Razorpay webhooks.
*   **Partially Implemented Systems:** Email notifications (SMTP setup is present in `.env`, but full transactional email templates might need polishing).
*   **Future Roadmap Ideas:** Advanced Analytics in Admin panel, dynamic discount codes engine.
*   **Production Readiness Tasks:**
    *   Verify all environment variables in Vercel.
    *   Run a staging test for Clerk domain and Razorpay webhooks.

## 8. Environment Variables

Documented in `production.env.example`.

| Variable | Purpose | Production Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | Required (Neon/Supabase) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Frontend Auth Key | Required (Live Key) |
| `CLERK_SECRET_KEY` | Clerk Backend Auth Key | Required (Live Key) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Defines the Admin User | Required |
| `RAZORPAY_KEY_ID` | Razorpay Public Key | Required (Live Key) |
| `RAZORPAY_KEY_SECRET` | Razorpay Private Key | Required (Live Key) |
| `KV_URL`, `KV_REST_API_*` | Upstash Redis connection | Required for caching |
| `NEXT_PUBLIC_CLOUDINARY_*` | Cloudinary Image Hosting | Required |
| `SMTP_*` | Transactional Email Service | Required for email notifications |

## 9. Deployment Status

*   **Deployment Platform:** Prepared for Vercel.
*   **Build Verification Status:** Successfully builds via `npm run build` (Next.js 16.2).
*   **Prisma Deployment Configuration:** `npx prisma generate` needs to run during build.
*   **Production Database Readiness:** Requires running `npx prisma db push` or migrations on the production DB.
*   **Third-party Services:** Need to switch Clerk and Razorpay from Test mode to Live mode before final launch.

## 10. Runtime / Build Issues

*   **Current Known Bugs:** None documented actively.
*   **TypeScript/Linting:** Managed via ESLint 9 + Next.js config.
*   **Image Optimization:** Cloudinary domains must be configured in `next.config.ts` `images.remotePatterns` to allow Next.js `next/image` to optimize them.

## 11. API Documentation

Located in `src/app/api/`:

*   `/api/admin`: Protected endpoints for fetching/modifying admin dashboard data.
*   `/api/bulk-inquiries`: POST to submit a new B2B inquiry. GET to list them (Admin only).
*   `/api/cart`: GET/POST/PUT/DELETE for persistent cart sync.
*   `/api/checkout`: Razorpay order ID generation and signature verification.
*   `/api/orders`: Order creation after payment success, and order history fetching.
*   `/api/send-email`: Utility endpoint for triggering SMTP transactional emails.
*   `/api/videos`: Fetching tradition video entries.
*   `/api/wishlist`: Manage user wishlists.

## 12. Admin System Documentation

Accessible at `/admin`.

*   **Admin Dashboard Flow:** Overview metrics (Sales, Orders, Inquiries).
*   **Order Management:** Update order statuses (PENDING -> SHIPPED -> DELIVERED).
*   **Bulk Uploads:** Dedicated UI to import product catalogs via CSV/Excel.
*   **Customer Inquiry Management:** Review B2B bulk requests and negotiate pricing.
*   **Role Protection:** Exclusively locked to `NEXT_PUBLIC_ADMIN_EMAIL`.

## 13. Performance Optimizations

*   **Prisma Singleton:** Implementation in `src/lib/prisma.ts` prevents connection limits from being exhausted in Next.js Hot Reloading and Serverless functions.
*   **Next.js Image Optimization:** Cloudinary offloads image processing. Next.js `<Image>` component handles lazy loading and WebP conversion.
*   **Caching Strategies:** Upstash Redis configured for rate limiting and potential KV caching of heavily hit catalog pages.

## 14. AI Collaboration Instructions

*   **Design Changes:** DO NOT guess class names. Use the `website_tech_stack_design_blueprint.md` file as the system prompt to understand the brand colors and typography before making UI modifications.
*   **Architecture Rules:** Always use App Router (`src/app`). Server Components by default, add `"use client"` only when React hooks (`useState`, `useEffect`) are strictly necessary.
*   **Database Changes:** Always store prices as Integers (paise). Do not use Floats for currency. Run `npx prisma format` after updating `schema.prisma`.
*   **Things Not to Overwrite:** Do not modify `middleware.ts` auth logic without explicit user instruction. Do not remove the `Bestsellers.tsx` styling logic.

## 15. Maintenance Rules

This document (`PROJECT_STATUS.md`) MUST be updated automatically after:
1.  Major feature implementations.
2.  Database schema changes (`schema.prisma`).
3.  New third-party integrations (e.g., adding SMS gateways).
4.  Architecture or routing modifications.
5.  Resolution of major deployment blockers.
