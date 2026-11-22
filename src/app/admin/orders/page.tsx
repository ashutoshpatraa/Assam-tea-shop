import { prisma } from "@/lib/prisma";
import OrderVerificationActions from "@/components/order-verification-actions";

export const instant = false;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const orders = await prisma.order.findMany({
    where: {
      isSample: false,
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { publicId: { contains: params.q } },
              { customer: { phone: { contains: params.q } } },
              { customer: { name: { contains: params.q } } },
            ],
          }
        : {}),
    },
    include: { customer: true, paymentSubmissions: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d6256]">Operations</p>
          <h1 className="mt-1 text-[34px] text-tea">Orders</h1>
        </div>
        <a href="/api/admin/orders/export" className="rounded-[4px] border border-tea px-4 py-2 font-bold text-tea">Export CSV</a>
      </div>
      <form className="mt-6 flex flex-wrap gap-2">
        <label htmlFor="status-filter" className="sr-only">Status</label>
        <select id="status-filter" name="status" defaultValue={params.status ?? ""} className="border border-[#cbc2b3] bg-[#fffdf7] px-3 py-2">
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "PAID", "PREPARING", "READY", "COMPLETED", "CANCELLED", "REFUNDED"].map((status) => <option key={status}>{status}</option>)}
        </select>
        <label htmlFor="order-search" className="sr-only">Search orders</label>
        <input id="order-search" name="q" defaultValue={params.q ?? ""} placeholder="Order ID or customer" className="border border-[#cbc2b3] bg-[#fffdf7] px-3 py-2" />
        <button className="rounded-[4px] bg-tea px-4 py-2 font-bold text-white">Filter</button>
      </form>
      <div className="mt-6 overflow-x-auto border border-[#cbc2b3] bg-[#fffdf7]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[#cbc2b3] bg-[#ece7dc]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">UTR / payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#d9cebd]">
                <td className="px-4 py-4 font-bold">{order.publicId}</td>
                <td className="px-4 py-4">{order.customer.name}<br /><span className="text-[#6d6256]">{order.customer.phone}</span></td>
                <td className="px-4 py-4">{order.status}</td>
                <td className="px-4 py-4">{order.orderType}{order.tableNumber ? ` · ${order.tableNumber}` : ""}</td>
                <td className="px-4 py-4 font-bold">₹{(order.totalPaise / 100).toFixed(2)}</td>
                <td className="px-4 py-4">
                  {order.paymentSubmissions.map((payment) => (
                    <div key={payment.id}>
                      <code>{payment.utr}</code>
                      {payment.screenshotUrl && <><br /><a className="border-b border-tea text-tea" href={payment.screenshotUrl} target="_blank" rel="noreferrer">View screenshot</a></>}
                    </div>
                  ))}
                  <OrderVerificationActions publicId={order.publicId} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p className="mt-5 border border-[#cbc2b3] bg-[#fffdf7] p-5 text-[#6d6256]">No orders match this filter.</p>}
    </div>
  );
}
