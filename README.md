# Brand Park

Men's clothing store — *Your Style. Your Space.* Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, PostgreSQL and Prisma 7.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env          # then review the values
npm run db:start              # local PostgreSQL on :5433 (keep this terminal open)
npm run db:deploy             # apply migrations
npm run db:seed               # sample catalogue + WELCOME10 test coupon
npm run dev                   # http://localhost:3000
```

`npm run db:start` runs a real PostgreSQL server from the `embedded-postgres` dev dependency, storing data in `.data/postgres`. You can point `DATABASE_URL` at any other PostgreSQL instead.

Password-reset links are printed to the dev-server console, because no email provider is configured.

## Checks

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Route type generation + `tsc` |
| `npm test` | Unit tests: pricing, coupons, query parsing, Razorpay signature checks |
| `npm run test:e2e` | Browser tests against a running dev server and database. It covers cart, stock limits, concurrent checkout, coupons, COD orders, order access control, accounts and wishlist. It uses the local Chrome install (`CHROME_PATH` to override) and changes data in the database it points at. |
| `npm run build` | Production build (needs the database: catalogue pages are prerendered) |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `DATABASE_POOL_MAX` | no | Connections per server instance (default 10; use 1–5 on serverless) |
| `APP_URL` | yes in production | Public origin, e.g. `https://brandpark.in` (canonical URLs, sitemap, reset links) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | no | Enables online payment. Without them, online payment is hidden. |
| `ENABLE_COD` | no | `"true"` offers cash on delivery |

If neither Razorpay nor COD is enabled, checkout tells the customer that no payment method is available, and no orders can be placed.

## Deploying to Vercel

1. Create a PostgreSQL database (Neon, Supabase, Prisma Postgres, or similar) and copy its **pooled** connection string.
2. Import the repository into Vercel and set the environment variables above for Production (and Preview if wanted). Set `DATABASE_POOL_MAX` to a small number such as `3`.
3. Deploy. Vercel runs `npm run vercel-build`, which applies pending migrations (`prisma migrate deploy`) and then builds. The build reads the database to prerender catalogue pages, so the database must be reachable from the build.
4. Load your real catalogue. `npm run db:seed` loads **sample** products only; it deletes and recreates catalogue tables, so never run it against a production database with real products.

## How it works

- **Data model:** `prisma/schema.prisma` covers users, sessions, products, variants (size × colour with stock), categories, collections, carts, wishlists, addresses, coupons, orders, order items and payments. Money is stored as integer paise.
- **Catalogue reads** are cached with `"use cache"` and tagged `catalog`. Placing or cancelling an order calls `updateTag("catalog")` so stock shown on product pages refreshes.
- **Cart and wishlist** belong to the signed-in user, or to a guest via an httpOnly cookie. Guest data merges into the account on sign-in.
- **Checkout** (`src/actions/checkout.ts`) recalculates prices, discounts and delivery on the server. It reserves stock with conditional decrements inside a transaction, so two shoppers can't buy the same last unit (covered by the e2e suite).
- **Razorpay:** an order stays `PENDING_PAYMENT` until the checkout signature is verified with your key secret. Unpaid orders release their stock after 30 minutes. Before cancelling one, the app asks Razorpay whether it was paid, so a buyer who closed the tab after paying is not cancelled. A Razorpay webhook is not yet implemented and is recommended for production.
- **Sessions:** a random 32-byte token sits in an httpOnly cookie, and only its SHA-256 hash is stored. Passwords use bcrypt (cost 12).
- **Order pages** (`/order-confirmation/[id]`) are visible only to the account that placed the order, or to someone holding the order's secret link.

## Business settings to confirm before launch

These live in `src/lib/config.ts`:

- `FREE_SHIPPING_THRESHOLD` — ₹1,999 (from the design)
- `RETURN_WINDOW_DAYS` — 14 (from the design)
- `STANDARD_SHIPPING_FEE` — ₹99, a **placeholder**

Also review: the policy pages (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms-and-conditions`), the sample product data and imagery, and the size guide, which has no measurements yet.
