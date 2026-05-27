# ShopNest — Production E-Commerce Frontend

A premium, full-stack ready e-commerce frontend built with **Next.js 15 App Router**, **React**, and **Tailwind CSS v4**. Features complete customer-facing pages and an admin dashboard with transparent GST pricing.

---

## 🚀 Quick Start

```bash
cd ecommerce
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ecommerce/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (CartProvider, Inter font)
│   │   ├── globals.css             # Global styles + Tailwind v4
│   │   ├── page.tsx                # Homepage (hero, categories, products)
│   │   ├── products/
│   │   │   ├── page.tsx            # Product listing with filters
│   │   │   └── [id]/page.tsx       # Product detail page
│   │   ├── cart/page.tsx           # Shopping cart
│   │   ├── checkout/page.tsx       # Checkout (address + payment)
│   │   ├── login/page.tsx          # Login / Signup
│   │   ├── orders/[orderId]/page.tsx # Order tracking
│   │   └── admin/
│   │       ├── layout.tsx          # Admin layout (sidebar + topbar)
│   │       ├── page.tsx            # Admin dashboard
│   │       ├── products/
│   │       │   ├── page.tsx        # Product list table
│   │       │   └── add/page.tsx    # Add product form
│   │       └── orders/page.tsx     # Order management
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky nav with cart badge
│   │   ├── Footer.tsx              # Full-width footer
│   │   ├── Sidebar.tsx             # Collapsible admin sidebar
│   │   ├── ProductCard.tsx         # Reusable product card
│   │   └── FormInput.tsx           # Reusable input/textarea/select
│   └── lib/
│       ├── mockData.ts             # All mock data (products, orders, stats)
│       └── cartContext.tsx         # Global cart state (Context + useReducer)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 🛍️ Customer Pages

| Route | Page |
|-------|------|
| `/` | Homepage — hero, categories, featured products, GST banner |
| `/products` | Product listing with category/price/rating filters |
| `/products/[id]` | Product detail with GST breakdown, quantity, related |
| `/cart` | Cart with quantity controls and GST summary |
| `/checkout` | Address form + COD/UPI/Card payment |
| `/login` | Login & Signup with Google button |
| `/orders/[orderId]` | Order tracking with progress timeline |

---

## 🔧 Admin Pages

| Route | Page |
|-------|------|
| `/admin` | Dashboard — revenue, orders, customer stats + tables |
| `/admin/products` | Product table with edit/delete |
| `/admin/products/add` | Add product form with **live GST calculator** |
| `/admin/orders` | Order management with status dropdown update |

---

## 💡 Key Features

### GST Transparency
- Every product shows **Base Price + GST % + Final Price**
- Cart shows itemized GST totals
- Checkout and order tracking show full GST breakdown
- Admin "Add Product" has a **live price calculator**

### Tech Highlights
- Next.js 15 App Router with TypeScript
- Tailwind CSS v4 with `@import "tailwindcss"`
- Global cart via React Context + useReducer
- Mock data in `/src/lib/mockData.ts` — no backend needed
- Reusable components: `ProductCard`, `FormInput`, `Navbar`, `Sidebar`, `Footer`
- Fully responsive: mobile-first with collapsible sidebar and filter drawer

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework |
| `react` / `react-dom` | UI library |
| `tailwindcss` | Styling |
| `lucide-react` | Icons |
| `typescript` | Type safety |
