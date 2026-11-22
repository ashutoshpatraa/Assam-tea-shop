"use client";

import { useState } from "react";

export default function NewMenuItemPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          description: data.get("description"),
          category: data.get("category"),
          pricePaise: Number(data.get("price")) * 100,
          dietary: data.get("dietary"),
          active: data.get("active") === "on",
          soldOutToday: data.get("soldOut") === "on",
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not create item.");
      window.location.assign("/admin/menu");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-[34px] text-tea">New menu item</h1>
      <form onSubmit={submit} className="mt-6 max-w-[700px] space-y-5">
        <label className="block font-bold">Name<input required name="name" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
        <label className="block font-bold">Description<textarea required name="description" rows={3} className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block font-bold">Category<select required name="category" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3"><option>Hot Tea</option><option>Cold Drinks</option><option>Snacks</option><option>Light Meals</option><option>Packaged Tea</option></select></label>
          <label className="block font-bold">Price in ₹<input required name="price" type="number" min="0" step="1" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3" /></label>
          <label className="block font-bold">Dietary<select required name="dietary" className="mt-2 w-full border border-[#cbc2b3] bg-[#fffdf7] px-3 py-3"><option value="VEG">Veg</option><option value="NON_VEG">Non-veg</option></select></label>
        </div>
        <label className="block"><input type="checkbox" name="active" defaultChecked className="mr-2" />Active</label>
        <label className="block"><input type="checkbox" name="soldOut" className="mr-2" />Sold out today</label>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <button disabled={submitting} className="rounded-[4px] bg-tea px-5 py-3 font-bold text-white disabled:bg-muted">{submitting ? "Saving…" : "Create item"}</button>
      </form>
    </div>
  );
}
