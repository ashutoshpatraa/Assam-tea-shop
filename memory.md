# Assam Tea Shop — Running Log

## 2026-11-22 — Project kickoff and phase 1 start

- **Changed:** Created the project context, roadmap, design system, and running log before adding application code. Workspace was empty; Node.js v26.11.1 and npm 11.20.0 are available.
- **Why:** Establish a durable source of truth and align implementation with the tea-garden brand and requested stack.
- **Decisions:** The owner authorized an invented, clearly labeled starter menu and temporary Assam details. No real menu, merchant UPI ID, address, hours, or visual reference links were supplied. Do not use a fake UPI ID; keep the shop closed and ordering blocked until real configuration is present. Use INR and the display payee name “Assam Tea Shop.”
- **Bugs/fixes:** None yet.
- **Future gotchas:** The site is not launch-ready until the owner replaces starter data and configures a valid UPI ID, payee settings, address, and opening hours. Do not claim test/sample orders are real.

## 2026-11-22 — Storefront and staff workflow implementation

- **Changed:** Built the Next.js storefront, persistent cart/customizations, checkout API, dynamic UPI payment page, tracking, protected admin shell, overview, orders, kitchen, menu, customers, settings, QR upload, and CSV export. Added Prisma SQLite schema and starter seed.
- **Why:** Deliver the requested browse-to-payment-to-kitchen workflow and a practical launch-safe admin experience.
- **Decisions:** The real-time shop remains closed because no real UPI ID/address/hours were supplied. Development smoke testing temporarily set open/configured flags and a clearly invalid `development-test@upi` ID, then restored closed/unconfigured state and marked the test order as sample data.
- **Bugs/fixes:** Fixed a Next.js layout type mismatch, seed nested-menu serialization, package audit advisories by pinning overrides, Cache Components build issues with route opt-outs/request-time connection access, and a settings UPI schema migration. Resolved lint effect and unescaped-apostrophe issues.
- **Verification:** `npm run lint` passes (with navigation warnings), `npm run typecheck` passes, `npm run build` passes, `/`, `/menu`, and `/admin-login` return HTTP 200, and a development-only smoke flow passed checkout, UTR payment submission, kitchen transitions, and tracking. The smoke script was removed after use.
- **Future gotchas:** The static upload tracing warnings do not block builds. Production deployment needs persistent storage for `/public/uploads`. Configure `ADMIN_EMAIL`, bcrypt `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, real UPI details, address/hours, and replace starter menu data before opening the shop.

## 2026-11-22 — README screenshots

- **Changed:** Added a Playwright screenshot script and README preview section for the home page, desktop menu, mobile menu, and admin login.
- **Why:** Give the owner a direct visual reference and an exact command for refreshing product screenshots.
- **Decisions:** Captures run against the closed, unconfigured development environment and must not be mistaken for a live launch.
- **Bugs/fixes:** The browser automation page screenshots were not persisted by the integrated capture tool, so a local Playwright setup was added to write PNG files into `docs/screenshots`.
- **Future gotchas:** Run `npm run dev` before `npm run screenshots`; replace starter captures after real menu/photos and business configuration are added.

## 2026-11-22 — Local starter artwork

- **Changed:** Replaced the empty hero/menu photo placeholders with original local SVG illustrations for Assam tea, milk chai, black tea, iced tea, samosas, egg puffs, masala omelette toast and loose-leaf tea.
- **Why:** The project needs complete visual assets immediately while avoiding unverified external photo ownership or blocked third-party downloads.
- **Decisions:** The imagery is explicitly starter artwork. It is stored locally under `public/images` and is wired into seed menu records and item pages. Real shop/product photography should replace it before launch.
- **Bugs/fixes:** Initial Wikimedia downloads were interrupted by a third-party 429 response; the local SVG implementation avoids that runtime dependency.
- **Future gotchas:** Owner-approved real photos should keep the same local `/images/...` or `/uploads/...` URL shape, and preserve meaningful alt text.

## 2026-11-22 — Windows launch scripts

- **Changed:** Added `setup.bat` and `run.bat` for one-click Windows setup and development launch.
- **Why:** Make local setup accessible without repeating PowerShell commands.
- **Decisions:** `setup.bat` preserves an existing `.env`, never enables starter data automatically, and stops on setup command failure. `run.bat` starts `npm run dev` and points the owner to setup if startup fails.
- **Bugs/fixes:** None; scripts use `%~dp0` so they work even when invoked outside the project directory.
- **Future gotchas:** Run `setup.bat` after cloning or changing dependencies/schema. Keep real environment credentials in `.env`, not in the batch files.
