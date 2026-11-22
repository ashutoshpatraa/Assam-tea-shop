import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { ManualUpiPaymentProvider } from "@/lib/payment-provider";
import PaymentSubmissionForm from "@/components/payment-submission-form";
import { expireUnpaidOrders } from "@/lib/expire-orders";
import { connection } from "next/server";

export const instant = false;

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  await connection();
  await expireUnpaidOrders();
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { customer: true, items: true, paymentSubmissions: true },
  });

  if (!order || order.isSample) notFound();

  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  const payeeName = settings?.payeeName || env.UPI_PAYEE_NAME;
  const upiId = settings?.upiId || env.UPI_ID;

  if (!upiId) {
    return (
      <div className="checkout-page" style={{ minHeight: "80vh" }}>
        <main className="shell" style={{ paddingBlock: "80px", maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              padding: "40px",
              border: "3px solid var(--black)",
              background: "var(--white)",
              boxShadow: "var(--shadow-xl)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚙️</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", textTransform: "uppercase", marginBottom: "14px" }}>
              Payment Setup Needed
            </h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: "24px" }}>
              The shop has not configured its UPI merchant ID yet. Please contact counter staff to complete your order.
            </p>
            <Link href="/menu" className="btn btn-primary" style={{ justifyContent: "center" }}>
              ← Return to Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const provider = new ManualUpiPaymentProvider();
  const payment = await provider.createPayment({
    orderId: order.publicId,
    amountPaise: order.totalPaise,
    payeeId: upiId,
    payeeName,
  });

  const qrDataUrl = await QRCode.toDataURL(payment.qrValue, { width: 320, margin: 2 });

  return (
    <div className="checkout-page">
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

            <Link href={`/track/${order.publicId}?phone=${encodeURIComponent(order.customer.phone)}`} className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
              Check Live Status →
            </Link>
          </div>

          <div className="checkout-steps-tracker">
            <div className="checkout-step-item is-completed">
              <span>01</span>
              <span>Cart ✓</span>
            </div>
            <div className="checkout-step-item is-completed">
              <span>02</span>
              <span>Details ✓</span>
            </div>
            <div className="checkout-step-item is-active">
              <span>03</span>
              <span>UPI Payment (Token {order.publicId})</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Payment Layout */}
      <main className="shell" style={{ paddingBlock: "40px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)", gap: "40px", alignItems: "start" }}>
          
          {/* Left: Dynamic UPI QR Box */}
          <div
            style={{
              background: "var(--white)",
              border: "3px solid var(--black)",
              boxShadow: "var(--shadow-xl)",
              padding: "32px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--red)", marginBottom: "6px" }}>
              Scan &amp; Pay
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", textTransform: "uppercase", color: "var(--black)", marginBottom: "16px" }}>
              Pay via any UPI App
            </h2>

            {/* QR Frame */}
            <div
              style={{
                border: "3px solid var(--black)",
                background: "var(--white)",
                boxShadow: "4px 4px 0 var(--black)",
                padding: "10px",
                marginInline: "auto",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`Scan UPI QR code to pay for order ${order.publicId}`}
                style={{ width: "260px", height: "260px", display: "block" }}
              />
            </div>

            {/* Amount Pill */}
            <div style={{ marginTop: "20px", width: "100%" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
                Exact Payable Amount
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "38px", color: "var(--black)", lineHeight: 1.1, marginTop: "4px" }}>
                ₹{(order.totalPaise / 100).toFixed(2)}
              </div>
            </div>

            {/* Payee Info */}
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "var(--cream)", border: "1.5px solid var(--black)", fontSize: "12px", width: "100%", textAlign: "left" }}>
              <div>Payee: <strong>{payeeName}</strong></div>
              <div style={{ color: "var(--muted)", marginTop: "2px", wordBreak: "break-all" }}>UPI ID: {upiId}</div>
            </div>

            {/* Mobile UPI Deep Link */}
            <a
              href={payment.deepLink}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "18px", justifyContent: "center" }}
            >
              📱 Tap to Pay on UPI App
            </a>
          </div>

          {/* Right: UTR Form & Step-by-Step Instructions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div
              style={{
                background: "var(--white)",
                border: "3px solid var(--black)",
                boxShadow: "var(--shadow-xl)",
                padding: "36px 32px",
              }}
            >
              <div style={{ borderBottom: "2px solid var(--black)", paddingBottom: "20px", marginBottom: "24px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--red)" }}>
                  Step 2 of 2
                </span>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 44px)", textTransform: "uppercase", lineHeight: 1, marginTop: "6px" }}>
                  Confirm Your Payment
                </h1>
                <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginTop: "10px" }}>
                  After transferring via GPay, PhonePe, Paytm, or BHIM, enter your 12-digit UPI reference (UTR) below so our counter can verify and start your order.
                </p>
              </div>

              {order.status === "PENDING_PAYMENT" ? (
                <PaymentSubmissionForm publicId={order.publicId} customerPhone={order.customer.phone} />
              ) : (
                <div style={{ padding: "20px", border: "2px solid var(--black)", background: "#dcfce7" }}>
                  <p style={{ fontWeight: 800, fontSize: "16px", color: "var(--green)" }}>
                    Payment has already been submitted for verification!
                  </p>
                  <div style={{ marginTop: "14px" }}>
                    <Link href={`/track/${order.publicId}?phone=${encodeURIComponent(order.customer.phone)}`} className="btn btn-primary">
                      Track Live Preparation →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Order Brief Summary */}
            <div
              style={{
                background: "var(--cream)",
                border: "3px solid var(--black)",
                boxShadow: "var(--shadow-md)",
                padding: "24px 28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--black)", paddingBottom: "10px", marginBottom: "14px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", textTransform: "uppercase" }}>
                  Order Details ({order.items.length} Item{order.items.length > 1 ? "s" : ""})
                </span>
                <span style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase", color: "var(--red)" }}>
                  Token {order.publicId}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>{item.quantity}× {item.nameSnapshot}</span>
                    <strong style={{ fontFamily: "var(--font-display)" }}>₹{((item.unitPricePaise * item.quantity) / 100).toFixed(0)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px dashed rgba(23,23,23,0.2)", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                <span>Fulfillment: <strong>{order.orderType}</strong></span>
                <span>Customer: <strong>{order.customer.name}</strong></span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
