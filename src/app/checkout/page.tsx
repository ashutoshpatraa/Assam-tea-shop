"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  menuItemId: string;
  name: string;
  slug: string;
  basePricePaise: number;
  priceDeltaPaise: number;
  quantity: number;
  dietary?: string;
  customizations?: Record<string, string[]>;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [orderType, setOrderType] = useState<"PICKUP" | "DINE_IN" | "DELIVERY">("PICKUP");

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [pickupPreset, setPickupPreset] = useState<"asap" | "30" | "45" | "custom">("asap");
  const [customPickupTime, setCustomPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load cart and query params safely on mount
  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam) {
        setOrderType("DINE_IN");
        setTableNumber(tableParam);
      }
      const raw = localStorage.getItem("assam-cart");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CartItem[];
          setCart(parsed);
        } catch {}
      }
      setReady(true);
    });
  }, []);

  // Compute live subtotal
  const subtotalPaise = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.basePricePaise + item.priceDeltaPaise) * item.quantity,
        0,
      ),
    [cart],
  );

  const deliveryFeePaise = orderType === "DELIVERY" ? 3000 : 0;
  const grandTotalPaise = subtotalPaise + deliveryFeePaise;

  // Calculate ISO string for pickup time
  function getPickupIso(): string {
    const now = Date.now();
    if (pickupPreset === "asap") {
      return new Date(now + 15 * 60 * 1000).toISOString();
    }
    if (pickupPreset === "30") {
      return new Date(now + 30 * 60 * 1000).toISOString();
    }
    if (pickupPreset === "45") {
      return new Date(now + 45 * 60 * 1000).toISOString();
    }
    if (customPickupTime) {
      const date = new Date(customPickupTime);
      if (!isNaN(date.getTime())) return date.toISOString();
    }
    // Fallback to 20 mins
    return new Date(now + 20 * 60 * 1000).toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    // Clean and validate phone (must be 10 digits starting with 6-9)
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.");
      return;
    }

    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      setError("Please specify your table number for dine-in service.");
      return;
    }

    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      setError("Please enter your complete delivery address.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        orderType,
        tableNumber: orderType === "DINE_IN" ? tableNumber.trim() : undefined,
        pickupAt: orderType === "PICKUP" ? getPickupIso() : undefined,
        deliveryAddress: orderType === "DELIVERY" ? deliveryAddress.trim() : undefined,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          customizations: item.customizations ?? {},
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { publicId?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Could not create order. Please try again.");
      }

      // Order created successfully — clear cart and route to payment
      localStorage.removeItem("assam-cart");
      router.push(`/payment/${data.publicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      {/* ===================== TOP STEP TRACKER ===================== */}
      <header className="checkout-header-bar">
        <div className="shell">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <Link href="/" className="nb-brand" style={{ color: "var(--white)" }}>
              <span className="nb-brand-leaf">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17 2C10 3 5 8 4 15c6 1 12-3 13-13Z" />
                </svg>
              </span>
              <span>
                ASSAM <em style={{ color: "var(--yellow)" }}>TEA SHOP</em>
              </span>
            </Link>

            <Link href="/cart" className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
              ← Return to Cart
            </Link>
          </div>

          <div className="checkout-steps-tracker">
            <Link href="/cart" className="checkout-step-item is-completed">
              <span>01</span>
              <span>Cart ✓</span>
            </Link>
            <div className="checkout-step-item is-active">
              <span>02</span>
              <span>Checkout &amp; Details</span>
            </div>
            <div className="checkout-step-item">
              <span>03</span>
              <span>UPI Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== MAIN CHECKOUT CONTENT ===================== */}
      <main className="shell">
        {!ready ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>
            Loading checkout…
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div
            style={{
              margin: "60px auto",
              maxWidth: "600px",
              padding: "50px 36px",
              border: "3px solid var(--black)",
              background: "var(--white)",
              boxShadow: "var(--shadow-xl)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 5vw, 48px)",
                textTransform: "uppercase",
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              Your Cart is Empty
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
              You don&apos;t have any items ready for checkout yet. Explore our handcrafted teas and hot bites to get started.
            </p>
            <Link href="/menu" className="btn btn-yellow" style={{ width: "100%", justifyContent: "center" }}>
              Explore The Menu →
            </Link>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* =========================================================
                LEFT COLUMN: CHECKOUT FORM
                ========================================================= */}
            <form onSubmit={handleSubmit} className="checkout-form-card">
              {/* SECTION 1: ORDER TYPE */}
              <div className="checkout-section-block">
                <div className="checkout-section-title">
                  <span className="checkout-section-num">01</span>
                  <span>How would you like your order?</span>
                </div>

                <div className="checkout-types-grid">
                  {/* Dine-In */}
                  <div
                    className={`checkout-type-card ${orderType === "DINE_IN" ? "is-active" : ""}`}
                    onClick={() => setOrderType("DINE_IN")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkout-type-icon">🪑</div>
                    <span className="checkout-type-name">Dine-In</span>
                    <span className="checkout-type-desc">Served fresh at your shop table</span>
                  </div>

                  {/* Pickup */}
                  <div
                    className={`checkout-type-card ${orderType === "PICKUP" ? "is-active" : ""}`}
                    onClick={() => setOrderType("PICKUP")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkout-type-icon">🥡</div>
                    <span className="checkout-type-name">Pickup</span>
                    <span className="checkout-type-desc">Skip wait, grab at the counter</span>
                  </div>

                  {/* Delivery */}
                  <div
                    className={`checkout-type-card ${orderType === "DELIVERY" ? "is-active" : ""}`}
                    onClick={() => setOrderType("DELIVERY")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkout-type-icon">🛵</div>
                    <span className="checkout-type-name">Delivery</span>
                    <span className="checkout-type-desc">Direct to your doorstep (+₹30)</span>
                  </div>
                </div>

                {/* Conditional Fields based on Order Type */}
                {orderType === "DINE_IN" && (
                  <div className="checkout-input-group" style={{ marginTop: "10px" }}>
                    <label className="checkout-label" htmlFor="table-input">
                      <span>Table Number *</span>
                      <span className="checkout-label-hint">Check the sticker on your table</span>
                    </label>
                    <input
                      id="table-input"
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 04, Corner booth"
                      className="checkout-input"
                    />
                  </div>
                )}

                {orderType === "PICKUP" && (
                  <div className="checkout-input-group" style={{ marginTop: "10px" }}>
                    <label className="checkout-label">
                      <span>Pickup Timing *</span>
                      <span className="checkout-label-hint">Prepared right on time</span>
                    </label>
                    <div className="checkout-chips-row">
                      <button
                        type="button"
                        className={`checkout-chip-btn ${pickupPreset === "asap" ? "is-active" : ""}`}
                        onClick={() => setPickupPreset("asap")}
                      >
                        ⚡ ASAP (~15 Mins)
                      </button>
                      <button
                        type="button"
                        className={`checkout-chip-btn ${pickupPreset === "30" ? "is-active" : ""}`}
                        onClick={() => setPickupPreset("30")}
                      >
                        🕒 In 30 Mins
                      </button>
                      <button
                        type="button"
                        className={`checkout-chip-btn ${pickupPreset === "45" ? "is-active" : ""}`}
                        onClick={() => setPickupPreset("45")}
                      >
                        🕔 In 45 Mins
                      </button>
                      <button
                        type="button"
                        className={`checkout-chip-btn ${pickupPreset === "custom" ? "is-active" : ""}`}
                        onClick={() => setPickupPreset("custom")}
                      >
                        📅 Choose Time
                      </button>
                    </div>

                    {pickupPreset === "custom" && (
                      <input
                        type="datetime-local"
                        required
                        value={customPickupTime}
                        onChange={(e) => setCustomPickupTime(e.target.value)}
                        className="checkout-input"
                        style={{ marginTop: "8px" }}
                      />
                    )}
                  </div>
                )}

                {orderType === "DELIVERY" && (
                  <div className="checkout-input-group" style={{ marginTop: "10px" }}>
                    <label className="checkout-label" htmlFor="delivery-address-input">
                      <span>Complete Delivery Address *</span>
                      <span className="checkout-label-hint">Include building &amp; landmark</span>
                    </label>
                    <textarea
                      id="delivery-address-input"
                      required
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Flat No., Building name, Street, Landmark, Pincode"
                      className="checkout-input"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: CONTACT DETAILS */}
              <div className="checkout-section-block">
                <div className="checkout-section-title">
                  <span className="checkout-section-num">02</span>
                  <span>Contact &amp; Identification</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  {/* Name */}
                  <div className="checkout-input-group">
                    <label className="checkout-label" htmlFor="name-input">
                      <span>Full Name *</span>
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priyam Barua"
                      className="checkout-input"
                    />
                  </div>

                  {/* Phone */}
                  <div className="checkout-input-group">
                    <label className="checkout-label" htmlFor="phone-input">
                      <span>Mobile Number (For Order Verification) *</span>
                    </label>
                    <div className="checkout-phone-wrap">
                      <span className="checkout-phone-prefix">🇮🇳 +91</span>
                      <input
                        id="phone-input"
                        type="tel"
                        required
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="checkout-phone-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="checkout-input-group" style={{ marginTop: "4px" }}>
                  <label className="checkout-label" htmlFor="email-input">
                    <span>Email Address (Optional)</span>
                    <span className="checkout-label-hint">For digital receipt</span>
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priyam@example.com"
                    className="checkout-input"
                  />
                </div>
              </div>

              {/* SECTION 3: KITCHEN NOTES */}
              <div className="checkout-section-block">
                <div className="checkout-section-title">
                  <span className="checkout-section-num">03</span>
                  <span>Kitchen Instructions (Optional)</span>
                </div>

                <div className="checkout-input-group">
                  <label className="checkout-label" htmlFor="notes-input">
                    <span>Special Notes</span>
                    <span className="checkout-label-hint">Sugar, spice, or packing preferences</span>
                  </label>
                  <textarea
                    id="notes-input"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra hot chai, pack separately in double cup, less spicy samosas..."
                    className="checkout-input"
                  />
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div role="alert" className="checkout-alert-error">
                  <span style={{ fontSize: "16px", marginRight: "8px" }}>⚠</span>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="checkout-submit-btn"
                >
                  {submitting ? (
                    <>CREATING ORDER TOKEN…</>
                  ) : (
                    <>
                      <span>PROCEED TO UPI PAYMENT</span>
                      <span>•</span>
                      <span>₹{(grandTotalPaise / 100).toFixed(0)}</span>
                      <span style={{ fontSize: "20px" }}>→</span>
                    </>
                  )}
                </button>

                <div className="checkout-security-note">
                  <span>🔒</span>
                  <span>Manual UPI QR verification • Direct counter token confirmation</span>
                </div>
              </div>
            </form>

            {/* =========================================================
                RIGHT COLUMN: LIVE ORDER SUMMARY CARD (~40%)
                ========================================================= */}
            <aside className="checkout-summary-card">
              <div className="checkout-summary-header">
                <span className="checkout-summary-title">Order Summary</span>
                <span className="checkout-summary-badge">
                  {cart.reduce((n, i) => n + i.quantity, 0)} Items
                </span>
              </div>

              <div className="checkout-summary-body">
                {/* Itemized List */}
                <div className="checkout-items-list">
                  {cart.map((item, idx) => {
                    const itemTotalPaise = (item.basePricePaise + item.priceDeltaPaise) * item.quantity;
                    return (
                      <div key={`${item.slug}-${idx}`} className="checkout-item-entry">
                        <div className="checkout-item-info">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 6px", border: "1px solid var(--black)", background: item.dietary === "VEG" ? "#eaf5eb" : "#fef2f2", color: item.dietary === "VEG" ? "var(--green)" : "var(--red)" }}>
                              {item.dietary === "VEG" ? "VEG" : "NON-VEG"}
                            </span>
                            <span className="checkout-item-name">{item.name}</span>
                          </div>

                          <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>
                            Qty: {item.quantity} × ₹{((item.basePricePaise + item.priceDeltaPaise) / 100).toFixed(0)}
                          </div>
                        </div>

                        <span className="checkout-item-price">
                          ₹{(itemTotalPaise / 100).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="checkout-breakdown-table">
                  <div className="checkout-breakdown-row">
                    <span>Items Subtotal</span>
                    <strong style={{ color: "var(--black)" }}>₹{(subtotalPaise / 100).toFixed(0)}</strong>
                  </div>

                  <div className="checkout-breakdown-row">
                    <span>Order Mode</span>
                    <span style={{ color: "var(--black)", fontWeight: 800, textTransform: "uppercase" }}>
                      {orderType === "DINE_IN" ? "Dine-In" : orderType === "PICKUP" ? "Pickup" : "Delivery"}
                    </span>
                  </div>

                  <div className="checkout-breakdown-row">
                    <span>Est. Preparation</span>
                    <span style={{ color: "var(--green)", fontWeight: 800 }}>⚡ 12–18 Mins</span>
                  </div>

                  {orderType === "DELIVERY" && (
                    <div className="checkout-breakdown-row">
                      <span>Delivery Fee</span>
                      <strong style={{ color: "var(--black)" }}>₹{(deliveryFeePaise / 100).toFixed(0)}</strong>
                    </div>
                  )}

                  {/* Total Row */}
                  <div className="checkout-total-row">
                    <span className="checkout-total-label">Grand Total</span>
                    <span className="checkout-total-val">₹{(grandTotalPaise / 100).toFixed(0)}</span>
                  </div>
                </div>

                {/* Return link */}
                <div style={{ textAlign: "center", paddingTop: "6px" }}>
                  <Link
                    href="/cart"
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--black)",
                      borderBottom: "2px solid var(--black)",
                      paddingBottom: "2px",
                    }}
                  >
                    ← Edit Items in Cart
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
