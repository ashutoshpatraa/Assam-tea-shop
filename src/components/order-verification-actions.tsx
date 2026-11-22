"use client";

export default function OrderVerificationActions({
  publicId,
  status,
}: {
  publicId: string;
  status: string;
}) {
  async function verify() {
    const response = await fetch(`/api/admin/orders/${publicId}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    if (response.ok) window.location.reload();
  }

  async function reject() {
    const note = window.prompt("Reason for rejection (shown internally)") ?? "";
    const response = await fetch(`/api/admin/orders/${publicId}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (response.ok) window.location.reload();
  }

  if (status !== "PAYMENT_SUBMITTED") return null;
  return (
    <div className="mt-2 flex gap-2">
      <button type="button" onClick={() => void verify()} className="rounded-[4px] bg-tea px-3 py-2 text-xs font-bold text-white">Verify payment</button>
      <button type="button" onClick={() => void reject()} className="rounded-[4px] border border-danger px-3 py-2 text-xs font-bold text-danger">Reject</button>
    </div>
  );
}
