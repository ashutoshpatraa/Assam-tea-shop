# Assam Tea Shop — Project Context

## Business

Assam Tea Shop is a warm, unpretentious neighborhood cafe for Assam chai and tea, snacks, light food, and packaged loose-leaf tea. It serves locals, students, office workers, and regulars who want to order ahead from a phone and skip the wait.

**Voice:** short, warm, lightly playful, and plain-spoken. Example: “Strong, sweet, properly brewed.” Do not use hype, invented testimonials, or claim unverified business facts.

## Menu and starter data

The owner authorized an invented starter menu because no real menu was supplied. Seed entries and prices are illustrative, editable examples only; they are not confirmed offerings or prices. Mark the seed/sample order as development data and replace it before launch.

Starter menu (all invented, editable examples; not the shop's real offerings/prices):

| Category | Item | Sample price | Dietary | Starter options |
|---|---|---:|---|---|
| Hot Tea | Assam Milk Chai | ₹30 | Veg | Sugar: regular/less/none; dairy or oat milk (+₹20); small (-₹5), regular, or large (+₹10); ginger/cardamom (+₹5 each) |
| Hot Tea | Black Assam Tea | ₹25 | Veg | No additional options |
| Cold Drinks | Iced Assam Chai | ₹65 | Veg | No additional options |
| Snacks | Vegetable Samosa | ₹25 | Veg | No additional options |
| Snacks | Egg Puff | ₹35 | Non-veg | No additional options |
| Light Meals | Masala Omelette Toast | ₹90 | Non-veg | No additional options |
| Packaged Tea | Assam CTC Loose Leaf (100 g) | ₹160 | Veg | No additional options |

Every item also carries active/sold-out availability fields. Replace every starter item, price, dietary marker, and option with owner-verified menu details before launch.

## Business settings and launch safety

- Business name: Assam Tea Shop.
- Currency/region: INR, India.
- Order types: dine-in and pickup; delivery is optional and disabled by default.
- Address: no real address supplied. If a temporary Assam address is needed for sample content, label it temporary and require replacement.
- Opening hours: not supplied. Do not invent hours as verified; require configuration and keep the shop closed until valid hours are saved.
- Admin open/closed switch defaults to closed. Unconfigured business details or payment settings must prevent live orders.

## UPI payment details

- Payee display name: Assam Tea Shop.
- Merchant UPI ID: not supplied. Read `UPI_ID` from server-only environment configuration; never embed an invented/fake ID or secret in application code.
- The project may show a configuration-required state until the merchant supplies a valid UPI ID. The static QR is uploaded by an authorized admin and is only a fallback image.
- Currency is INR. Customer payment confirmation is manual: collect a required UTR, optionally collect a screenshot, and clearly state that the order is confirmed only after verification.

## Technology

- Next.js App Router with TypeScript for server-rendered customer pages and protected admin workflows.
- Tailwind CSS for a responsive, token-driven interface.
- SQLite through Prisma for local development and a straightforward later move to PostgreSQL.
- Zod for environment and request validation.
- Secure admin password hashing and an HTTP-only session cookie; credentials are environment-only.
- Local upload storage under `public/uploads`, isolated behind an interface for a future object-storage adapter.
- A `PaymentProvider` boundary keeps manual UPI independent from future payment gateways.

## Constraints

- Validate all API input; calculate totals and enforce availability on the server.
- Keep secrets server-side. Do not enable ordering with placeholder business/payment configuration.
- Limit and validate uploaded file type and size.
- Responsive, accessible, keyboard-operable UI with clear loading, empty, and error states.
- Starter menu, prices, address, hours, sample orders, and photos must never be represented as verified real-world information.

## Implementation status

The project is implemented and built successfully. Live ordering remains blocked in the default database because the shop is closed and unconfigured. A development-only smoke order passed checkout, UTR submission and status progression, and was marked as sample data. Real payment, business, and menu setup are still required before launch.
