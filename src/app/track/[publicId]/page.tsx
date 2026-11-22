import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const instant = false;

const statusLabels: Record<string, { label: string; desc: string; color: string; badgeBg: string }> = {
  PENDING_PAYMENT: {
    label: "Awaiting Payment",
    desc: "Please complete your UPI payment and submit the transaction UTR.",
    color: "#D94B35",
    badgeBg: "#fee2e2",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment Submitted",
    desc: "We have received your UTR. Staff is verifying with bank records.",
    color: "#B45309",
    badgeBg: "#fef3c7",
  },
  PAID: {
    label: "Payment Verified ✓",
    desc: "Payment confirmed! Order sent to our kitchen team.",
    color: "#174B37",
    badgeBg: "#dcfce7",
  },
  PREPARING: {
    label: "Brewing & Preparing 🔥",
    desc: "Our chai walas are freshly brewing your tea and hot snacks.",
    color: "#174B37",
    badgeBg: "#dcfce7",
  },
  READY: {
    label: "Order Ready for Pickup! ☕",
    desc: "Hot, fragrant, and ready at the counter or table.",
    color: "#174B37",
    badgeBg: "#bbf7d0",
  },
  COMPLETED: {
    label: "Completed",
    desc: "Thank you for stopping by Assam Tea Shop. Enjoy your chai break!",
    color: "#171717",
    badgeBg: "#f5ebd8",
  },
  CANCELLED: {
    label: "Order Cancelled",
    desc: "This order was cancelled. Please speak with staff for assistance.",
    color: "#D94B35",
    badgeBg: "#fee2e2",
  },
  REFUNDED: {
    label: "Refunded",
    desc: "Payment has been returned to the original payment source.",
    color: "#6B7B6E",
    badgeBg: "#e5e7eb",
  },
};

const allMilestones = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "PAID", "PREPARING", "READY", "COMPLETED"];

export default async function TrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { publicId } = await params;
  const { phone } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { customer: true, items: true },
  });

  if (!order || order.isSample) notFound();

  // If phone is missing or doesn't match, show verification form instead of abrupt 404
  const isPhoneVerified = phone && order.customer.phone === phone.replace(/\D/g, "").slice(-10);

  if (!isPhoneVerified) {
    return (
      <div className="checkout-page" style={{ minHeight: "80vh" }}>
        <header className="checkout-header-bar">
          <div className="shell" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" className="nb-brand" style={{ color: "var(--white)" }}>
              <span>ASSAM <em style={{ color: "var(--yellow)" }}>TEA SHOP</em></span>
            </Link>
            <Link href="/menu" className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
              ← Return to Menu
            </Link>
          </div>
        </header>

        <main className="shell" style={{ paddingBlock: "60px" }}>
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              padding: "40px 32px",
              border: "3px solid var(--black)",
              background: "var(--white)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px" }}>
              Security Verification
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", textTransform: "uppercase", color: "var(--black)", lineHeight: 1.1, marginBottom: "16px" }}>
              Verify Phone for {order.publicId}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
              To view real-time preparation status and receipt details for this order, please confirm your 10-digit mobile number.
            </p>

            <form method="GET" action={`/track/${order.publicId}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }} htmlFor="track-phone-input">
                  Your Mobile Number
                </label>
                <div style={{ display: "flex", border: "2px solid var(--black)", boxShadow: "3px 3px 0 var(--black)", background: "var(--white)" }}>
                  <span style={{ padding: "12px 14px", background: "var(--cream)", borderRight: "2px solid var(--black)", fontWeight: 700, fontSize: "13px" }}>
                    +91
                  </span>
                  <input
                    id="track-phone-input"
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    style={{ flex: 1, padding: "12px", border: "none", outline: "none", fontWeight: 600, fontSize: "14px" }}
                  />
                </div>
              </div>

              {phone && (
                <div style={{ padding: "10px 14px", border: "2px solid var(--black)", background: "#fee2e2", color: "#991b1b", fontSize: "12px", fontWeight: 700, marginBottom: "18px" }}>
                  Phone number does not match this order. Please try again.
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
                Verify &amp; View Order →
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const currentStatusInfo = statusLabels[order.status] || {
    label: order.status,
    desc: "Order status is currently being updated.",
    color: "#171717",
    badgeBg: "#f5ebd8",
  };

  const currentIndex = allMilestones.indexOf(order.status);
  const isTerminated = ["CANCELLED", "REFUNDED"].includes(order.status);

  return (
    <div className="checkout-page">
      {/* Top Header */}
      <header className="checkout-header-bar">
        <div className="shell">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <Link href="/" className="nb-brand" style={{ color: "var(--white)" }}>
              <span>ASSAM <em style={{ color: "var(--yellow)" }}>TEA SHOP</em></span>
            </Link>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/menu" className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
                ← Menu
              </Link>
              <Link href="/track" className="pdp-back-link" style={{ background: "transparent", color: "var(--white)", borderColor: "rgba(255,253,245,0.4)" }}>
                Find Other Order
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Order Tracker Content */}
      <main className="shell" style={{ paddingBlock: "40px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "36px", alignItems: "start" }}>
          
          {/* Left: Status & Timeline Card */}
          <div
            style={{
              background: "var(--white)",
              border: "3px solid var(--black)",
              boxShadow: "var(--shadow-xl)",
              padding: "36px 32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "2px solid var(--black)", paddingBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--red)" }}>
                  Live Order Tracker
                </span>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 54px)", color: "var(--black)", lineHeight: 1, marginTop: "6px" }}>
                  {order.publicId}
                </h1>
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  border: "2px solid var(--black)",
                  background: currentStatusInfo.badgeBg,
                  color: currentStatusInfo.color,
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "3px 3px 0 var(--black)",
                }}
              >
                {currentStatusInfo.label}
              </div>
            </div>

            {/* Description Callout */}
            <div style={{ marginTop: "24px", padding: "16px 20px", border: "2px solid var(--black)", background: "var(--cream)", boxShadow: "3px 3px 0 var(--black)" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--black)" }}>
                {currentStatusInfo.desc}
              </p>
              {order.status === "PENDING_PAYMENT" && (
                <div style={{ marginTop: "14px" }}>
                  <Link href={`/payment/${order.publicId}`} className="btn btn-primary btn-sm">
                    Complete UPI Payment Now →
                  </Link>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            {!isTerminated && (
              <div style={{ marginTop: "36px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", textTransform: "uppercase", marginBottom: "20px" }}>
                  Order Progression
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative", paddingLeft: "32px", borderLeft: "3px solid var(--black)", marginLeft: "12px" }}>
                  {allMilestones.map((st, idx) => {
                    const info = statusLabels[st];
                    const isPassed = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;

                    return (
                      <div key={st} style={{ position: "relative", paddingBottom: idx < allMilestones.length - 1 ? "24px" : "0" }}>
                        {/* Dot indicator */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-42px",
                            top: "2px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "3px solid var(--black)",
                            background: isCurrent ? "var(--yellow)" : isPassed ? "var(--green)" : "var(--white)",
                            boxShadow: isCurrent ? "2px 2px 0 var(--black)" : "none",
                          }}
                        />

                        <div>
                          <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "14px", textTransform: "uppercase", color: isPassed ? "var(--black)" : "var(--muted)" }}>
                            {info.label} {isPassed && !isCurrent ? "✓" : isCurrent ? "• ACTIVE" : ""}
                          </div>
                          <div style={{ fontSize: "12px", color: isPassed ? "var(--muted)" : "rgba(23,23,23,0.4)", marginTop: "2px" }}>
                            {info.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary & Customer Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: "var(--white)",
                border: "3px solid var(--black)",
                boxShadow: "var(--shadow-xl)",
                padding: "28px 24px",
              }}
            >
              <div style={{ borderBottom: "2px solid var(--black)", paddingBottom: "14px", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", textTransform: "uppercase" }}>
                  Order Items ({order.items.length})
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", paddingBottom: "10px", borderBottom: "1px dashed rgba(23,23,23,0.15)" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--black)", textTransform: "uppercase" }}>
                        {item.quantity}× {item.nameSnapshot}
                      </div>
                    </div>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>
                      ₹{((item.unitPricePaise * item.quantity) / 100).toFixed(0)}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "18px", borderTop: "2px solid var(--black)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", textTransform: "uppercase" }}>Total Paid</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--black)" }}>
                  ₹{(order.totalPaise / 100).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Delivery/Pickup Info */}
            <div
              style={{
                background: "var(--cream)",
                border: "3px solid var(--black)",
                boxShadow: "var(--shadow-md)",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                Order Fulfillment
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", textTransform: "uppercase", marginBottom: "12px" }}>
                {order.orderType === "DINE_IN" ? `🪑 Dine-In · Table ${order.tableNumber ?? "Counter"}` : order.orderType === "PICKUP" ? "🥡 Counter Pickup" : "🛵 Home Delivery"}
              </div>

              {order.deliveryAddress && (
                <p style={{ fontSize: "13px", color: "var(--black)", lineHeight: 1.5 }}>
                  <strong>Address:</strong> {order.deliveryAddress}
                </p>
              )}
              {order.notes && (
                <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px", fontStyle: "italic" }}>
                  &ldquo;{order.notes}&rdquo;
                </p>
              )}

              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(23,23,23,0.15)", fontSize: "12px", color: "var(--muted)" }}>
                Customer: <strong>{order.customer.name}</strong> (+91 {order.customer.phone})
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
