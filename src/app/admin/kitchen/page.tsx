"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type KitchenOrder = {
  publicId: string;
  status: string;
  orderType: string;
  tableNumber: string | null;
  items: Array<{ nameSnapshot: string; quantity: number }>;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [error, setError] = useState("");
  const previousCount = useRef(0);

  function playNewPaidOrderSound() {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  }

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/kitchen", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load kitchen orders.");
      const result = await response.json() as { orders: KitchenOrder[] };
      const paidCount = result.orders.filter((order) => order.status === "PAID").length;
      if (previousCount.current > 0 && paidCount > previousCount.current) {
        playNewPaidOrderSound();
      }
      previousCount.current = paidCount;
      setOrders(result.orders);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load kitchen orders.");
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load]);

  async function changeStatus(publicId: string, status: "PREPARING" | "READY" | "COMPLETED") {
    await fetch(`/api/admin/orders/${publicId}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-[38px] text-tea">Kitchen</h1>
      <p className="mt-1 text-sm text-[#6d6256]">Auto-refreshes every 5 seconds</p>
      {error && <p role="alert" className="mt-4 text-danger">{error}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <article key={order.publicId} className="border-2 border-[#cbc2b3] bg-[#fffdf7] p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[30px] leading-none text-tea">{order.publicId}</h2>
              <span className="text-sm font-bold">{order.orderType === "DINE_IN" ? `Table ${order.tableNumber}` : order.orderType}</span>
            </div>
            <div className="mt-5 space-y-2 border-y border-[#d9cebd] py-4">
              {order.items.map((item, index) => (
                <p key={index} className="text-xl font-bold"><span className="mr-3 text-gamosa">{item.quantity}×</span>{item.nameSnapshot}</p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "PAID" && (
                <button onClick={() => void changeStatus(order.publicId, "PREPARING")} className="rounded-[4px] bg-tea px-4 py-3 text-lg font-bold text-white">Preparing</button>
              )}
              {order.status === "PREPARING" && (
                <button onClick={() => void changeStatus(order.publicId, "READY")} className="rounded-[4px] bg-gamosa px-4 py-3 text-lg font-bold text-white">Ready</button>
              )}
              {order.status === "READY" && (
                <button onClick={() => void changeStatus(order.publicId, "COMPLETED")} className="rounded-[4px] border-2 border-tea px-4 py-3 text-lg font-bold text-tea">Done</button>
              )}
            </div>
          </article>
        ))}
      </div>
      {orders.length === 0 && <p className="mt-8 border border-[#cbc2b3] bg-[#fffdf7] p-6 text-[#6d6256]">No active kitchen orders.</p>}
    </div>
  );
}
