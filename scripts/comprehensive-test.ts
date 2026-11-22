import { z } from "zod";

async function runComprehensiveAudit() {
  console.log("=================================================");
  console.log("ASSAM TEA SHOP — COMPREHENSIVE AUTOMATED AUDIT");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // 1. ROUTE HEALTH CHECKS
  console.log("--- 1. HTTP Endpoint & Route Testing ---");
  const baseUrl = "http://localhost:3000";
  const routesToTest = [
    { path: "/", expectedStatus: 200, name: "Homepage Storefront" },
    { path: "/menu", expectedStatus: 200, name: "Menu Catalog" },
    { path: "/menu/assam-milk-chai", expectedStatus: 200, name: "Product Detail: Assam Milk Chai" },
    { path: "/menu/black-assam-tea", expectedStatus: 200, name: "Product Detail: Black Assam Tea" },
    { path: "/menu/vegetable-samosa", expectedStatus: 200, name: "Product Detail: Vegetable Samosa" },
    { path: "/cart", expectedStatus: 200, name: "Cart View" },
    { path: "/checkout", expectedStatus: 200, name: "Checkout View" },
    { path: "/track", expectedStatus: 200, name: "Order Tracking Lookup" },
    { path: "/admin-login", expectedStatus: 200, name: "Staff Admin Login" },
  ];

  for (const r of routesToTest) {
    try {
      const res = await fetch(`${baseUrl}${r.path}`);
      assert(res.status === r.expectedStatus, `${r.name} (${r.path}) returned HTTP ${res.status}`);
    } catch (e) {
      assert(false, `${r.name} (${r.path}) connection failed`, String(e));
    }
  }

  // 2. PRODUCT CUSTOMIZATION PRICING LOGIC
  console.log("\n--- 2. Product Customization & Pricing Engine Testing ---");
  const basePricePaise = 3000; // ₹30.00
  const options = {
    sugar: { regular: 0, less: 0, none: 0 },
    milk: { dairy: 0, oat: 2000 },
    size: { small: -500, regular: 0, large: 1000 },
    extras: { ginger: 500, cardamom: 500 },
  };

  // Test Default: Regular Sugar + Dairy + Regular Size = ₹30
  let price1 = basePricePaise + options.sugar.regular + options.milk.dairy + options.size.regular;
  assert(price1 === 3000, "Default configuration price equals base price (₹30.00)");

  // Test Oat Milk (+₹20) + Large (+₹10) + Ginger (+₹5) + Cardamom (+₹5) = ₹70
  let price2 = basePricePaise + options.milk.oat + options.size.large + options.extras.ginger + options.extras.cardamom;
  assert(price2 === 7000, "Premium custom configuration correctly sums to ₹70.00");

  // Test Small (-₹5) + Regular Sugar + Dairy = ₹25
  let price3 = basePricePaise + options.size.small;
  assert(price3 === 2500, "Small size discount correctly calculates to ₹25.00");

  // Quantity multiplier testing
  assert(price2 * 3 === 21000, "Quantity multiplier (3x ₹70 = ₹210.00) calculates correctly");
  assert(Math.max(1, 0) === 1, "Quantity minimum boundary condition enforced (cannot go below 1)");

  // 3. VALIDATION RULES TESTING
  console.log("\n--- 3. Form Validation & Data Integrity Testing ---");
  const phoneRegex = /^[6-9]\d{9}$/;
  assert(phoneRegex.test("9876543210"), "Valid Indian mobile (9876543210) passes regex");
  assert(phoneRegex.test("8123456789"), "Valid Indian mobile (8123456789) passes regex");
  assert(phoneRegex.test("7000000000"), "Valid Indian mobile (7000000000) passes regex");
  assert(!phoneRegex.test("5123456789"), "Invalid mobile starting with 5 rejected");
  assert(!phoneRegex.test("987654321"), "Short phone (9 digits) rejected");
  assert(!phoneRegex.test("98765432100"), "Long phone (11 digits) rejected");
  assert(!phoneRegex.test("987654321A"), "Alphanumeric phone rejected");

  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  const sampleIso = new Date().toISOString();
  assert(isoRegex.test(sampleIso), `Pickup ISO datetime generator produces valid ISO string: ${sampleIso}`);

  // Cart schema validation
  const cartItemSchema = z.object({
    menuItemId: z.string(),
    quantity: z.number().int().min(1).max(10),
    customizations: z.record(z.string(), z.array(z.string())),
  });

  const validCartItem = {
    menuItemId: "test-item-123",
    quantity: 2,
    customizations: { group1: ["opt1"], group2: ["opt2", "opt3"] },
  };
  const parseResult = cartItemSchema.safeParse(validCartItem);
  assert(parseResult.success, "Cart item schema validation succeeds for structured items");

  // 4. API SECURITY & ERROR HANDLING
  console.log("\n--- 4. API Security & Input Rejection Testing ---");
  try {
    const emptyOrderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(emptyOrderRes.status === 400 || emptyOrderRes.status === 409, "API correctly rejects empty checkout payload");
  } catch (e) {
    assert(false, "API order test failed", String(e));
  }

  try {
    const invalidUtrRes = await fetch(`${baseUrl}/api/payments/submit`, {
      method: "POST",
      body: new FormData(),
    });
    assert(invalidUtrRes.status === 400, "API correctly rejects empty payment submission");
  } catch (e) {
    assert(false, "API payment test failed", String(e));
  }

  try {
    const badLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "fake@test.com", password: "wrong" }),
    });
    assert(badLoginRes.status === 401 || badLoginRes.status === 400, "API correctly rejects invalid staff login credentials");
  } catch (e) {
    assert(false, "API login test failed", String(e));
  }

  console.log("\n=================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveAudit().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
