# Assam Tea Shop — Design System

## Direction

A well-run neighborhood tea shop, not a corporate chain: rooted in Assam tea gardens, warm, practical, and quietly confident. Use editorial asymmetry and real photography when available. Any generated starter imagery or address/menu copy must be visibly marked as a placeholder.

## Color tokens

| Token | Value | Use |
|---|---|---|
| Tea leaf | `#214B3A` | Brand, primary actions, navigation |
| Tea leaf dark | `#173729` | Hover/pressed primary, deep surfaces |
| Gamosa red | `#A64032` | Small accent, status emphasis, decorative stitch |
| Warm cream | `#F7F1E5` | Page background |
| Paper | `#FFFCF5` | Raised content surfaces |
| Dark brown | `#2D261F` | Main text |
| Muted brown | `#6D6256` | Supporting text |
| Border | `#D9CEBD` | Dividers and form boundaries |
| Success | `#2F6849` | Positive state |
| Warning | `#8A571C` | Pending state |
| Danger | `#9C352B` | Error/destructive state |

Use the green/brown/cream family for most surfaces; red is a restrained accent, not a large background. Check text contrast against WCAG AA before shipping.

## Typography

- Display: **Fraunces**, for page titles and a few editorial callouts.
- Body/UI: **Karla**, for paragraphs, labels, menus, forms, and admin tables.
- Use a clear size hierarchy (display 48–64px desktop / 38–46px mobile; page title 36/32px; section title 26/24px; body 16px; compact metadata 13–14px).
- Load through the app's font integration, with sensible serif/sans fallbacks. Avoid system-default-only typography.

## Spacing, radii, and elevation

- Base spacing scale: 8px increments (`4px` allowed only for tight icon/text alignment); common steps 8, 16, 24, 32, 48, 64, 80.
- Content width: 1200px maximum; reading text width about 68 characters.
- Radii: 4px for controls, 8px for content panels, 999px only for pills/toggles.
- Shadows: use sparingly; default surfaces rely on color and borders. Reserve a soft low-elevation shadow for menus/popovers only.

## Component rules

- Buttons: clear verb-first labels, 44px minimum touch target, visible keyboard focus, disabled state with explanation when useful.
- Forms: persistent labels, inline field errors, native semantics, no placeholder-only labels.
- Dietary markers: text/icon plus accessible label; never rely on color alone.
- Cards: restrained borders, consistent spacing, no universal rounded-2xl/shadow treatment.
- Motion: brief opacity/color/position feedback only; honor reduced-motion preferences.
- Gamosa reference: a thin red/green woven-style divider or footer trim, used once or twice, never as wallpaper.
- No emoji as icons, fake metrics/testimonials, gradient backgrounds, glass effects, glow, or hover-scale on every element.

## Page layouts

- **Home:** left-aligned editorial headline and order CTA; asymmetric photo/content hero; featured menu as a compact curated row/list; how-to-order steps; practical shop address/hours and map link; patterned footer trim.
- **Menu:** category navigation and search above a responsive menu list; readable prices and dietary markers; item details in a focused page or accessible dialog.
- **Cart/checkout/payment:** narrow, calm single-column forms with a persistent total/order summary on larger screens; stack naturally on phones.
- **Tracking:** short order ID, high-contrast current status, concise timeline, and verification disclaimer.
- **Admin:** dense neutral surfaces, compact tables and filters, clear status colors, utility-first navigation; no marketing hero.
- **Kitchen:** tablet-friendly high contrast, large order IDs and item quantities, minimal controls, statuses glanceable from a distance.

## Reference notes

No reference URLs were supplied. Visual direction follows the written brief only. Replace temporary address, menu, and any placeholder photography before launch.

## Implemented component states

- Closed-shop banner: high-visibility warm warning at the top of storefront pages; ordering APIs remain blocked.
- Starter-data labels: visible in menu admin rows and global launch messaging; never presented as verified facts.
- Photo placeholders: editorial neutral surfaces with an explicit “Photo placeholder” label.
- Admin surfaces: compact neutral borders and dense tables; no marketing treatment.
- Kitchen cards: oversized order IDs and quantities, high-contrast status actions, 5-second polling and Web Audio beep on newly paid orders.
- Payment page: local QR data URL, mobile UPI deep-link action, explicit manual-verification wording, and optional screenshot upload.
