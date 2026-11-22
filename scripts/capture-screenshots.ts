import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";

async function main() {
  await mkdir("docs/screenshots", { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/home.png", fullPage: true });

  await desktop.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/menu.png", fullPage: true });

  await desktop.goto(`${baseUrl}/admin-login`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/admin-login.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/menu-mobile.png", fullPage: true });

  await browser.close();
  console.log("Captured home, menu, mobile menu, and admin login screenshots.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
