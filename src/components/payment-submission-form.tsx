"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSubmissionForm({
  publicId,
  customerPhone,
}: {
  publicId: string;
  customerPhone?: string;
}) {
  const router = useRouter();
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const cleanUtr = utr.trim();
    if (cleanUtr.length < 6) {
      setError("Please enter a valid UPI transaction reference / UTR number (at least 6 characters).");
      setSubmitting(false);
      return;
    }

    const body = new FormData();
    body.set("publicId", publicId);
    body.set("utr", cleanUtr);
    if (file) body.set("screenshot", file);

    try {
      const response = await fetch("/api/payments/submit", { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not submit payment.");

      // Route to tracking page with customer phone so verification succeeds seamlessly
      const targetUrl = customerPhone
        ? `/track/${publicId}?phone=${encodeURIComponent(customerPhone)}`
        : `/track/${publicId}`;

      router.push(targetUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* UTR Input */}
      <div className="checkout-input-group">
        <label className="checkout-label" htmlFor="utr-input">
          <span>UPI Reference / UTR Number *</span>
          <span className="checkout-label-hint">12-digit bank reference number</span>
        </label>
        <input
          id="utr-input"
          required
          minLength={6}
          maxLength={80}
          value={utr}
          onChange={(event) => setUtr(event.target.value)}
          placeholder="e.g. 431289567812"
          className="checkout-input"
          style={{ fontFamily: "monospace", fontSize: "15px", letterSpacing: "0.05em" }}
        />
      </div>

      {/* Screenshot Upload */}
      <div className="checkout-input-group">
        <label className="checkout-label" htmlFor="screenshot-input">
          <span>Payment Screenshot (Optional)</span>
          <span className="checkout-label-hint">Speeds up counter verification</span>
        </label>
        <div
          style={{
            border: "2px dashed var(--black)",
            background: "var(--cream)",
            padding: "16px",
            textAlign: "center",
            boxShadow: "3px 3px 0 var(--black)",
          }}
        >
          <input
            id="screenshot-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            style={{ width: "100%", fontSize: "13px", cursor: "pointer" }}
          />
          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>
            JPEG, PNG or WebP up to 5 MB
          </div>
        </div>
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
        style={{ width: "100%", padding: "16px", justifyContent: "center", fontSize: "15px" }}
      >
        {submitting ? "VERIFYING & RECORDING…" : "SUBMIT PAYMENT FOR VERIFICATION →"}
      </button>
    </form>
  );
}
