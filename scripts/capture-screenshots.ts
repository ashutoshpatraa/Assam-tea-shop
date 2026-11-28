import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

async function main() {
  await mkdir("docs/screenshots", { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const sampleCart = [
    {
      menuItemId: "item-chai-1",
      name: "Assam Milk Chai",
      slug: "assam-milk-chai",
      basePricePaise: 3000,
      priceDeltaPaise: 2500,
      quantity: 2,
      dietary: "VEG",
      customizations: {
        "Sugar": ["Regular"],
        "Milk": ["Oat milk (+₹20)"],
        "Cup size": ["Large (+₹10)"],
        "Add a little extra": ["Cardamom (+₹5)"],
      },
    },
    {
      menuItemId: "item-samosa-2",
      name: "Vegetable Samosa",
      slug: "vegetable-samosa",
      basePricePaise: 2000,
      priceDeltaPaise: 0,
      quantity: 2,
      dietary: "VEG",
    },
  ];

  // 1. Desktop Browser Context (1440 x 900)
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  // Home Desktop
  console.log("Capturing Home (Desktop)...");
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/home.png", fullPage: true });
  await desktop.screenshot({ path: "docs/screenshots/home-current.png", fullPage: false });

  // Menu Desktop
  console.log("Capturing Menu (Desktop)...");
  await desktop.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/menu.png", fullPage: true });

  // Assam Milk Chai PDP Desktop
  console.log("Capturing Assam Milk Chai PDP (Desktop)...");
  await desktop.goto(`${baseUrl}/menu/assam-milk-chai`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/assam-milk-chai.png", fullPage: true });

  // Seed sample cart into localStorage
  await desktop.evaluate((cartData) => {
    localStorage.setItem("assam-cart", JSON.stringify(cartData));
  }, sampleCart);

  // Cart Desktop
  console.log("Capturing Cart (Desktop)...");
  await desktop.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/cart.png", fullPage: true });

  // Checkout Desktop
  console.log("Capturing Checkout (Desktop)...");
  await desktop.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/checkout.png", fullPage: true });

  // Admin Login Desktop
  console.log("Capturing Admin Login (Desktop)...");
  await desktop.goto(`${baseUrl}/admin-login`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: "docs/screenshots/admin-login.png", fullPage: true });

  // 2. Mobile Browser Context (390 x 844)
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });

  // Home Mobile
  console.log("Capturing Home (Mobile)...");
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/home-mobile.png", fullPage: true });
  await mobile.screenshot({ path: "docs/screenshots/home-mobile-current.png", fullPage: false });

  // Menu Mobile
  console.log("Capturing Menu (Mobile)...");
  await mobile.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/menu-mobile.png", fullPage: true });

  // Assam Milk Chai PDP Mobile
  console.log("Capturing Assam Milk Chai PDP (Mobile)...");
  await mobile.goto(`${baseUrl}/menu/assam-milk-chai`, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/assam-milk-chai-mobile.png", fullPage: true });

  // Seed cart for mobile
  await mobile.evaluate((cartData) => {
    localStorage.setItem("assam-cart", JSON.stringify(cartData));
  }, sampleCart);

  // Checkout Mobile
  console.log("Capturing Checkout (Mobile)...");
  await mobile.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: "docs/screenshots/checkout-mobile.png", fullPage: true });

  await browser.close();
  console.log("✓ All latest screenshots successfully updated!");
}

main().catch((error: unknown) => {
  console.error("Screenshot capture failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
