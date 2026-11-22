# Assam Tea Shop — Project Roadmap

Status legend: `[x]` done · `[-]` in progress · `[ ]` next

## Phase 1 — Setup and database
- [x] Inspect workspace/tooling and initialize the Next.js App Router project.
- [x] Create the four project memory files before application code.
- [x] Configure TypeScript, Tailwind, linting, environment validation, `.env.example`, and exact setup documentation.
- [x] Define Prisma schema/migrations for menu, options, settings, orders, customers, and payment submissions.
- [x] Add labeled starter menu data and one clearly identified sample order.
- [x] Add secure admin password/session foundation and login rate limiting.

## Phase 2 — Design system and shared layout
- [x] Define CSS color tokens, typography, spacing, and accessible component rules in `design.md`.
- [x] Build responsive customer/admin shells, navigation, footer, and reusable loading/empty/error states.
- [x] Derive open/closed status from configured hours and admin control; default closed until configured.

## Phase 3 — Storefront and menu
- [x] Build home page with hero, featured menu, ordering steps, shop details, and map link.
- [x] Build searchable/category-filtered menu and item detail pages with dietary markers and availability.
- [x] Add clearly labeled photo placeholders and local upload abstraction.

## Phase 4 — Cart and checkout
- [x] Implement persistent cart, item customization, quantity changes, and totals.
- [x] Validate dine-in/table, pickup/time slot, and optional delivery checkout.
- [x] Recalculate prices and availability server-side; block ordering when closed/unconfigured.
- [x] Support `/order?table=5` and readable order IDs.

## Phase 5 — UPI payment
- [x] Add the `PaymentProvider` interface and dynamic UPI deep-link/QR flow.
- [x] Collect UTR and optional payment screenshot with upload validation.
- [x] Enforce unique UTRs, state transitions, configured expiry, and stock release.
- [x] Make manual verification status clear to customers.

## Phase 6 — Admin and kitchen
- [x] Build protected overview, order filters/details, payment verification/rejection, notes, receipts, and CSV export.
- [x] Add menu CRUD, availability controls, customer history, business settings, delivery rules, and UPI QR upload.
- [x] Add auto-refreshing kitchen view and new-paid-order notification.
- [x] Protect/validate all admin APIs and show pending verification counts.

## Phase 7 — Polish and verification
- [x] Test pricing, checkout, permissions, payment transitions, UTR uniqueness, and expiry.
- [x] Verify browse → checkout → payment submission → kitchen → customer tracking in a development-only smoke flow.
- [x] Validate responsive/accessibility states and production build.
- [x] Update all project memory files for each completed phase.

## Decisions

- Starter menu and prices are invented only because the owner authorized starter data after no real menu was provided. They must be labeled unverified and replaced.
- No real UPI ID, address, or opening hours were provided. Fake payment identifiers are not used; the shop starts closed and live ordering remains blocked until valid settings are configured.
- The project root was empty at kickoff. See `memory.md` for the dated activity log and current setup notes.
