"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackLookupPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanId = orderId.trim().toUpperCase();
    if (!/^AT-\d{4,}$/i.test(cleanId)) {
      setError("Please enter a valid order ID format, such as AT-0001.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter the 10-digit mobile number associated with this order.");
      return;
    }

    router.push(`/track/${encodeURIComponent(cleanId)}?phone=${encodeURIComponent(cleanPhone)}`);
  }

  return (
    <div className="checkout-page" style={{ minHeight: "85vh" }}>
      {/* Top Header */}
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

            <Link href="/menu" className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
              ← Return to Menu
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="shell" style={{ paddingBlock: "60px" }}>
        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "44px 36px",
            border: "3px solid var(--black)",
            background: "var(--white)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px" }}>
            Order Status Lookup
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(34px, 5vw, 48px)",
              textTransform: "uppercase",
              color: "var(--black)",
              lineHeight: 1,
              marginBottom: "16px",
            }}
          >
            Track An Order
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
            Check the live brewing, kitchen progress, or delivery status of your Assam Tea Shop order.
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Order ID */}
            <div className="checkout-input-group">
              <label className="checkout-label" htmlFor="lookup-order-id">
                <span>Order Token ID *</span>
                <span className="checkout-label-hint">Shown after checkout (e.g. AT-0001)</span>
              </label>
              <input
                id="lookup-order-id"
                required
                value={orderId}
                onChange={(event) => setOrderId(event.target.value.toUpperCase())}
                placeholder="AT-0001"
                className="checkout-input"
              />
            </div>

            {/* Phone */}
            <div className="checkout-input-group">
              <label className="checkout-label" htmlFor="lookup-phone">
                <span>Registered Mobile Number *</span>
                <span className="checkout-label-hint">Used during order placement</span>
              </label>
              <div className="checkout-phone-wrap">
                <span className="checkout-phone-prefix">🇮🇳 +91</span>
                <input
                  id="lookup-phone"
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="checkout-phone-input"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="checkout-alert-error">
                <span style={{ marginRight: "8px" }}>⚠</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: "16px", justifyContent: "center", marginTop: "8px", fontSize: "15px" }}>
              Find Live Order Status →
            </button>
          </form>

          <div style={{ marginTop: "28px", borderTop: "2px solid var(--black)", paddingTop: "18px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>
            <Link href="/menu" style={{ color: "var(--black)", textDecoration: "underline" }}>
              Browse the menu
            </Link>
            <Link href="/cart" style={{ color: "var(--black)", textDecoration: "underline" }}>
              Check your cart
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
