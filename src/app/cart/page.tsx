"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  menuItemId: string;
  name: string;
  slug: string;
  basePricePaise: number;
  priceDeltaPaise: number;
  quantity: number;
  dietary: string;
  customizations: Record<string, string[]>;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem("assam-cart");
      setCart(raw ? (JSON.parse(raw) as CartItem[]) : []);
      setReady(true);
    });
  }, []);

  function save(next: CartItem[]) {
    setCart(next);
    localStorage.setItem("assam-cart", JSON.stringify(next));
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.basePricePaise + item.priceDeltaPaise) * item.quantity,
    0,
  );

  return (
    <main style={{ minHeight: "70vh", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{
        background: "var(--black)",
        borderBottom: "3px solid var(--black)",
        padding: "48px 0 40px",
      }}>
        <div className="shell">
          <p style={{
            fontSize: "11px", fontWeight: 800, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--yellow)", marginBottom: "12px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ display: "block", width: "24px", height: "2px", background: "var(--yellow)" }} />
            Your Order
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 7vw, 100px)",
            color: "var(--white)",
            textTransform: "uppercase",
            lineHeight: 0.9,
          }}>
            YOUR <span style={{ color: "var(--yellow)" }}>CART.</span>
          </h1>
        </div>
      </div>

      <div className="shell" style={{ paddingBlock: "56px" }}>
        {!ready ? (
          <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "16px" }}>
            Loading your cart…
          </p>
        ) : cart.length === 0 ? (
          <div style={{
            padding: "60px",
            border: "3px solid var(--black)",
            background: "var(--white)",
            textAlign: "center",
            boxShadow: "6px 6px 0 var(--black)",
          }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "var(--black)",
              textTransform: "uppercase",
              lineHeight: 0.95,
              marginBottom: "24px",
            }}>
              Cart is<br />Empty.
            </p>
            <p style={{ color: "var(--muted)", marginBottom: "32px", fontSize: "16px" }}>
              Time to pick something good.
            </p>
            <Link href="/menu" className="btn btn-primary">
              Browse The Menu →
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "32px",
            alignItems: "start",
          }}>
            {/* Cart items */}
            <div style={{ border: "2px solid var(--black)", background: "var(--white)" }}>
              {cart.map((item, index) => (
                <article
                  key={`${item.slug}-${index}`}
                  style={{
                    padding: "28px 24px",
                    borderBottom: index < cart.length - 1 ? "2px solid var(--black)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "24px", color: "var(--black)", lineHeight: 1.0,
                        textTransform: "uppercase",
                      }}>
                        {item.name}
                      </h2>
                      <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "6px" }}>
                        {item.dietary === "VEG" ? "✓ Vegetarian" : "◈ Non-Vegetarian"}
                      </p>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: "6px 14px",
                        border: "2px solid var(--black)",
                        background: "transparent",
                        color: "var(--red)",
                        fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        boxShadow: "2px 2px 0 var(--black)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      onClick={() => save(cart.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{
                    marginTop: "20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <label
                        style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
                        htmlFor={`qty-${index}`}
                      >
                        Qty:
                      </label>
                      <select
                        id={`qty-${index}`}
                        value={item.quantity}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          save(cart.map((entry, i) => i === index ? { ...entry, quantity } : entry));
                        }}
                        style={{
                          padding: "8px 12px",
                          border: "2px solid var(--black)",
                          background: "var(--cream)",
                          fontFamily: "var(--font-body)",
                          fontSize: "14px", fontWeight: 700,
                          boxShadow: "2px 2px 0 var(--black)",
                          cursor: "pointer",
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--black)" }}>
                      ₹{((item.basePricePaise + item.priceDeltaPaise) * item.quantity / 100).toFixed(0)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>

            {/* Summary */}
            <aside style={{
              border: "3px solid var(--black)",
              background: "var(--white)",
              boxShadow: "6px 6px 0 var(--black)",
              position: "sticky",
              top: "90px",
            }}>
              <div style={{
                background: "var(--black)",
                color: "var(--yellow)",
                padding: "16px 24px",
                fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                Order Summary
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: "16px", borderBottom: "2px solid var(--black)",
                }}>
                  <span style={{ fontWeight: 600 }}>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
                  <strong style={{ fontFamily: "var(--font-display)", fontSize: "24px" }}>
                    ₹{(subtotal / 100).toFixed(0)}
                  </strong>
                </div>
                <Link
                  href="/checkout"
                  className="btn btn-primary"
                  style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "20px" }}
                >
                  Continue to Checkout →
                </Link>
                <Link
                  href="/menu"
                  className="btn btn-outline"
                  style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "12px" }}
                >
                  ← Add More Items
                </Link>
              </div>
            </aside>
          </div>
        )}

        <div style={{ marginTop: "40px" }}>
          <Link href="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
