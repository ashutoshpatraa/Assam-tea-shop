import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export const instant = false;

export default async function AdminOverviewPage() {
  await connection();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayOrders, pending, soldOut, settings] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: today }, isSample: false } }),
    prisma.paymentSubmission.count({ where: { status: "SUBMITTED" } }),
    prisma.menuItem.count({ where: { soldOutToday: true } }),
    prisma.businessSettings.findUnique({ where: { id: "default" } }),
  ]);
  const revenue = todayOrders
    .filter((order) => ["PAID", "PREPARING", "READY", "COMPLETED"].includes(order.status))
    .reduce((sum, order) => sum + order.totalPaise, 0);

  return (
    <div className="p-5 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d6256]">Today</p>
          <h1 className="mt-1 text-[34px] text-tea">Overview</h1>
        </div>
        <span className={`rounded-full px-3 py-2 text-sm font-bold ${settings?.shopOpen ? "bg-[#dceadf] text-[#2f6849]" : "bg-[#eee7dc] text-[#6d6256]"}`}>
          {settings?.shopOpen ? "Shop open" : "Shop closed"}
        </span>
      </div>
      <div className="mt-6 grid gap-px overflow-hidden border border-[#cbc2b3] bg-[#cbc2b3] sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Today's orders", String(todayOrders.length)],
          ["Revenue", `₹${(revenue / 100).toFixed(0)}`],
          ["Awaiting verification", String(pending)],
          ["Sold out today", String(soldOut)],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#fffdf7] p-5">
            <p className="text-sm text-[#6d6256]">{label}</p>
            <p className="mt-3 text-[32px] font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
