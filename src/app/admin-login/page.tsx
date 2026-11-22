"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Login failed.");
      router.push("/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          border: "3px solid var(--black)",
          background: "var(--white)",
          boxShadow: "var(--shadow-xl)",
          padding: "44px 36px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--red)" }}>
            Assam Tea Shop
          </span>
          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--black)", background: "var(--yellow)" }}>
            Staff Only
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 42px)",
            textTransform: "uppercase",
            color: "var(--black)",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          Admin Portal
        </h1>

        <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.5, marginBottom: "28px" }}>
          Authorized staff sign-in for orders, kitchen display, and shop management.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="checkout-input-group">
            <label className="checkout-label" htmlFor="admin-email">
              Staff Email
            </label>
            <input
              id="admin-email"
              required
              type="email"
              name="email"
              autoComplete="username"
              placeholder="admin@assamteashop.local"
              className="checkout-input"
            />
          </div>

          <div className="checkout-input-group">
            <label className="checkout-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              required
              type="password"
              name="password"
              autoComplete="current-password"
              className="checkout-input"
            />
          </div>

          {error && (
            <div role="alert" className="checkout-alert-error">
              <span style={{ marginRight: "8px" }}>⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "15px", marginTop: "8px" }}
          >
            {submitting ? "VERIFYING CREDENTIALS…" : "SIGN IN TO DASHBOARD →"}
          </button>
        </form>

        <div style={{ marginTop: "28px", borderTop: "2px solid var(--black)", paddingTop: "18px", textAlign: "center" }}>
          <Link
            href="/"
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
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
