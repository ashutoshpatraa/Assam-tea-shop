import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";

async function main() {
  await mkdir("docs/screenshots", { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });
  await desktop.goto("http://localhost:3000/menu/assam-milk-chai", { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/assam-milk-chai.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto("http://localhost:3000/menu/assam-milk-chai", { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/assam-milk-chai-mobile.png", fullPage: true });

  await browser.close();
  console.log("Captured assam-milk-chai desktop and mobile screenshots successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
