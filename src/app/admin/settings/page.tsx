"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load settings.");
        return response.json() as Promise<{ settings: Record<string, unknown> }>;
      })
      .then(({ settings }) => {
        const form = document.querySelector<HTMLFormElement>("form");
        if (!form) return;
        for (const [name, value] of Object.entries(settings)) {
          if (name === "openingHours" || name === "deliveryFeePaise") continue;
          const field = form.elements.namedItem(name);
          if (field instanceof HTMLInputElement) {
            if (field.type === "checkbox") field.checked = Boolean(value);
            else if (typeof value === "string" || typeof value === "number") field.value = String(value);
          }
        }
        const feeField = form.elements.namedItem("deliveryFee");
        if (feeField instanceof HTMLInputElement) feeField.value = String(Number(settings.deliveryFeePaise ?? 0) / 100);
        const openingHours = Array.isArray(settings.openingHours)
          ? settings.openingHours as Array<{ weekday: number; isClosed: boolean; openMinute: number | null; closeMinute: number | null }>
          : [];
        for (const hours of openingHours) {
          const closed = form.elements.namedItem(`closed-${hours.weekday}`);
          const open = form.elements.namedItem(`open-${hours.weekday}`);
          const close = form.elements.namedItem(`close-${hours.weekday}`);
          if (closed instanceof HTMLInputElement) closed.checked = hours.isClosed;
          if (open instanceof HTMLInputElement) open.value = hours.openMinute == null ? "" : `${String(Math.floor(hours.openMinute / 60)).padStart(2, "0")}:${String(hours.openMinute % 60).padStart(2, "0")}`;
          if (close instanceof HTMLInputElement) close.value = hours.closeMinute == null ? "" : `${String(Math.floor(hours.closeMinute / 60)).padStart(2, "0")}:${String(hours.closeMinute % 60).padStart(2, "0")}`;
        }
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    const data = new FormData(event.currentTarget);
    const parseTime = (value: FormDataEntryValue | null) => {
      if (typeof value !== "string" || !value) return null;
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const openingHours = Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      isClosed: data.get(`closed-${weekday}`) === "on",
      openMinute: parseTime(data.get(`open-${weekday}`)),
      closeMinute: parseTime(data.get(`close-${weekday}`)),
    }));
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shopOpen: data.get("shopOpen") === "on",
          businessConfigured: data.get("businessConfigured") === "on",
          address: data.get("address"),
          mapUrl: data.get("mapUrl") || "",
          upiId: data.get("upiId"),
          payeeName: data.get("payeeName"),
          deliveryEnabled: data.get("deliveryEnabled") === "on",
          deliveryFeePaise: Number(data.get("deliveryFee")) * 100,
          orderExpiryMinutes: Number(data.get("orderExpiryMinutes")),
          pickupIntervalMinutes: Number(data.get("pickupIntervalMinutes")),
          openingHours,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save.");
      setSaved("Settings saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadQr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved("");
    const response = await fetch("/api/admin/settings", { method: "POST", body: new FormData(event.currentTarget) });
    const result = await response.json() as { error?: string };
    if (!response.ok) setError(result.error || "Could not upload QR.");
    else setSaved("Static QR uploaded.");
  }

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-[34px] text-tea">Settings</h1>
      {loading ? <p className="mt-6 text-[#6d6256]">Loading settings…</p> : (
        <div className="mt-6 max-w-[760px] space-y-8">
          <form onSubmit={submit} className="space-y-5">
            <label className="block"><input type="checkbox" name="shopOpen" className="mr-2" />Master shop open / closed switch</label>
            <label className="block"><input type="checkbox" name="businessConfigured" className="mr-2" />Business details have been verified and are launch-ready</label>
            <label className="block font-bold">Address<textarea name="address" rows={3} className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
            <label className="block font-bold">Map URL<input name="mapUrl" type="url" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block font-bold">UPI ID<input name="upiId" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
              <label className="block font-bold">UPI payee name<input name="payeeName" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
            </div>
            <label className="block"><input type="checkbox" name="deliveryEnabled" className="mr-2" />Enable delivery</label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block font-bold">Delivery fee (₹)<input name="deliveryFee" type="number" min="0" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
              <label className="block font-bold">Expiry (minutes)<input name="orderExpiryMinutes" type="number" min="5" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
              <label className="block font-bold">Pickup interval (minutes)<input name="pickupIntervalMinutes" type="number" min="5" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
            </div>
            <fieldset className="border-t border-[#cbc2b3] pt-5">
              <legend className="font-bold">Opening hours</legend>
              <div className="mt-3 space-y-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, weekday) => (
                  <div key={day} className="grid grid-cols-[100px_70px_1fr_1fr] items-center gap-2 text-sm">
                    <strong>{day}</strong>
                    <label><input type="checkbox" name={`closed-${weekday}`} className="mr-1" />Closed</label>
                    <input aria-label={`${day} opening time`} name={`open-${weekday}`} type="time" className="border border-[#cbc2b3] bg-[#fffdf7] px-2 py-2" />
                    <input aria-label={`${day} closing time`} name={`close-${weekday}`} type="time" className="border border-[#cbc2b3] bg-[#fffdf7] px-2 py-2" />
                  </div>
                ))}
              </div>
            </fieldset>
            {error && <p role="alert" className="text-danger">{error}</p>}
            {saved && <p role="status" className="text-[#2f6849]">{saved}</p>}
            <button disabled={saving} className="rounded-[4px] bg-tea px-5 py-3 font-bold text-white disabled:bg-muted">{saving ? "Saving…" : "Save settings"}</button>
          </form>
          <form onSubmit={uploadQr} className="border-t border-[#cbc2b3] pt-6">
            <label className="block font-bold">Static fallback QR image
              <input name="qr" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block text-sm" />
            </label>
            <button className="mt-4 rounded-[4px] border border-tea px-4 py-2 font-bold text-tea">Upload QR</button>
          </form>
        </div>
      )}
    </div>
  );
}
