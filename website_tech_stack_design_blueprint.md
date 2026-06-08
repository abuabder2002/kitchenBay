# Technical Stack & Design Architecture Blueprint
## E-commerce Storefront: Kitchenbay Craft / Kitchenbay

This document provides a highly detailed explanation of the website's tech stack, directory structure, data models, state flows, and design system. **You can copy-paste this document directly into another LLM** to teach it the application context, making it extremely easy to request design changes later.

---

## 1. Technical Stack Overview

The application is built on a modern, high-performance, enterprise-grade JavaScript stack, using the latest major versions of React and Next.js:

*   **Core Framework**: **Next.js 16.2.4** utilizing the modern **App Router** (`src/app/` directory). This enables server-side rendering (SSR), static site generation (SSG), React Server Components (RSC), and file-system routing.
*   **Library/Runtime**: **React 19.2.4** (with full support for native Server Components, Client Components, and advanced Hooks).
*   **Database & ORM**: **PostgreSQL** (hosted on a cloud database like Neon) coupled with **Prisma ORM (v7.8.0)**. 
*   **Styling Engine**: **Tailwind CSS v4** (using the new `@tailwindcss/postcss` setup) which handles style configurations directly in the CSS file (`src/app/globals.css`) rather than a traditional `tailwind.config.js`.
*   **Authentication**: **Auth.js v5 Beta** (`next-auth` `5.0.0-beta.31` with `bcryptjs` for local credential hashing) featuring session handling and role-based routing (e.g. `USER` and `ADMIN` roles).
*   **Payment Gateway**: **Razorpay SDK (v2.9.6)** integration, fully configured to handle secure local payments (UPI, Card, NetBanking) inside India.
*   **Media Cloud Storage**: **Cloudinary (v2.10.0)** for uploading, optimizing, and serving product catalog pictures.
*   **Key-Value Cache**: **Upstash Redis (`@upstash/redis` v1.38.0)** for super-fast session caching and rate-limiting.
*   **Monitoring**: **Sentry (`@sentry/nextjs` v10.53.1)** for error tracking and runtime performance insights.
*   **Icons**: **Lucide React (v1.11.0)** for high-quality SVG iconography.

---

## 2. Design System & Aesthetics

The storefront features a luxury, premium, minimalist aesthetic inspired by high-end Indian handicraft design. It avoids generic, raw primary colors in favor of custom-tailored HSL and Hex values.

### Color Palette (Tailwind CSS v4 Theme Variables)
Located in `src/app/globals.css`, these values serve as the website's brand system:
*   `--color-brand-accent`: `#1D4ED8` (Royal Cobalt Blue used for call-to-actions, badges, links, active selections, and indicators).
*   `--color-brand-bg`: `#FFFFFF` (Pure white background for pages, forms, and secondary panels).
*   `--color-brand-card`: `#F8FAFC` (A very soft, premium, light slate-gray used to define card borders, backgrounds, search inputs, and sections like bestsellers).
*   `--color-brand-text`: `#0F172A` (Deep slate-black for headings and body copy to ensure premium readability).
*   `--color-brand-muted`: `#475569` (Medium slate-gray for product descriptions, helper text, and secondary navigation elements).

### Typography Scale
The layout uses a deliberate pairing of classic serif and sleek sans-serif typography:
1.  **Serif Font**: `Playfair Display` (configured as `--font-playfair` via Next.js Font Optimization). Used for headings, high-end hero text, quotes, and spotlight banners.
2.  **Sans-Serif Font**: `DM Sans` (configured as `--font-dm-sans` via Next.js Font Optimization). Used for main body copy, navigation, buttons, prices, and forms to keep the UI clean and scannable.

### Premium Design Features & Motion Details
*   **Cinematic Video Hero Banner**: The landing page integrates a background loop (`/video/SjM_u.mp4`) covered by a smooth CSS gradient overlay (`bg-gradient-to-t from-black/80 via-black/30 to-transparent`) for a high-end cinematic feel.
*   **Micro-animations & Hover Interactions**: Image grids and buttons use smooth scaling and transitions (e.g. `group-hover:scale-105 duration-700` and `grayscale group-hover:grayscale-0`) to give the website a responsive, living feel.
*   **Infinite Announcement Bar**: A sliding text announcement strip in the header powered by a custom CSS marquee animation (`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`).

---

## 3. Directory & File Architecture

The project maintains a structured directory separating visual files from underlying logic:

```bash
ecommerce/
├── prisma/
│   └── schema.prisma        # Database schema (PostgreSQL + Prisma)
├── public/
│   ├── video/               # Cinematic video assets
│   └── images/              # Custom brand static images (e.g., logo.jpeg)
├── src/
│   ├── app/                 # Next.js App Router (Pages, APIs, Layouts)
│   │   ├── admin/           # Admin Dashboard routes
│   │   ├── api/             # API Endpoints (orders, payments, products)
│   │   ├── products/        # Product catalogue (Listings, Filters, Detail views)
│   │   ├── cart/            # Shopping Cart pages
│   │   ├── checkout/        # Checkout flow and Razorpay gateway pages
│   │   ├── story/           # Brand story page ("About Us")
│   │   ├── globals.css      # Core Design CSS (Tailwind v4 Theme Definitions)
│   │   ├── layout.tsx       # Root layout, Google Fonts integration & Context Providers
│   │   └── page.tsx         # Storefront Homepage
│   ├── components/          # Reusable UI Blocks
│   │   ├── Navbar.tsx       # Scrolling header, search input, cart, auth widgets
│   │   ├── Footer.tsx       # Brand footer links, socials, newsletter sign-ups
│   │   ├── ProductCard.tsx  # Product tile (quick add, hover effects, price conversion)
│   │   ├── Sidebar.tsx      # Filtering & navigation sidebar
│   │   └── Providers.tsx    # Context wrapper providers (Auth, Theme)
│   └── lib/                 # Shared Business Logic & Global States
│       ├── authContext.tsx  # Firebase / NextAuth client session hook
│       ├── cartContext.tsx  # Global shopping cart logic (Local Storage cached)
│       ├── wishlistContext.tsx # Wishlist state (Add, remove, toggle hooks)
│       ├── productsContext.tsx # Database product cache context
│       └── prisma.ts        # Global Prisma Client singleton initialization
```

---

## 4. Database Schema (`prisma/schema.prisma`)

Crucial points to convey to an LLM regarding data representations:
1.  **Price Storage**: All monetary fields (e.g. `Product.price` and `OrderItem.price`) are stored as **Integers in Paise** (Rupee * 100). This guarantees precision and completely eliminates floating-point math bugs during financial and tax calculations.
2.  **GST Compliance**: The `Product` schema features a default `gstPercent` parameter (default is `18`). Order pipelines split this tax equally between **CGST (9%)** and **SGST (9%)** to comply with Indian e-commerce standards.
3.  **Core Schemas**:
    *   `User`: Keeps names, roles (`USER`, `ADMIN`), passwords, addresses, and order histories.
    *   `Product`: Contains name, description, categories, image URL, stock counters, ratings, and featured status flags.
    *   `Order` & `OrderItem`: Tracks order status, payment logs, linked `razorpayId` keys, and transaction prices at the checkout timestamp.

---

## 5. Global State & Context Flows

State is managed via decoupled, robust React context providers located in `src/lib/`:
1.  **Cart State (`cartContext.tsx`)**: Tracks items, totals, quantities, and GST/CGST/SGST breakdowns. Persists across page refreshes via `localStorage`.
2.  **Wishlist State (`wishlistContext.tsx`)**: Allows immediate hearting/wishlist-adds from product lists. Persists in memory / local state.
3.  **Auth State (`authContext.tsx`)**: Controls user session visibility, login credentials, and routes permission gates.

---

## 6. How to Instruct Future LLMs to Change the Design

When you are ready to adjust or rewrite the design, **give this prompt to your chosen LLM**:

> ### [LLM PROMPT TEMPLATE]
> 
> "I have an e-commerce website built with Next.js App Router, Tailwind CSS v4, and Prisma PostgreSQL. Below is the blueprint of the tech stack and styling.
> 
> [INSERT THIS ENTIRE DOCUMENT HERE]
> 
> I would like to change the design of the site. Please help me modify the code files according to the following design requirements:
> 
> 1. **Change the Brand Colors**: I want to modify the theme. (Example: 'Change from Blue & White to a luxury terracotta palette with Warm Clay `#C26D5C` as accent, Warm Sand `#FAFAF8` as background, and Slate `#1E293B` as text.')
> 2. **Adjust the Typography**: (Example: 'Replace Playfair Display with Outfit from Google Fonts, and adjust `--font-serif` values.')
> 3. **Change Specific Page Elements**: (Example: 'Modify the hero section in `src/app/page.tsx` to use a clean grid list of categories instead of a background video.')
> 
> Please show me the exact code diffs for `src/app/globals.css`, `src/app/layout.tsx`, and the target component files, keeping all functional logic, context links, and databases completely intact."

---
