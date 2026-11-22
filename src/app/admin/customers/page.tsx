import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { orders: { where: { isSample: false }, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="p-5 md:p-8">
      <h1 className="text-[34px] text-tea">Customers</h1>
      <div className="mt-6 overflow-x-auto border border-[#cbc2b3] bg-[#fffdf7]">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-[#cbc2b3] bg-[#ece7dc]">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Orders</th></tr>
          </thead>
          <tbody>
            {customers.filter((customer) => customer.orders.length > 0).map((customer) => (
              <tr key={customer.id} className="border-t border-[#d9cebd]">
                <td className="px-4 py-4 font-bold">{customer.name}</td>
                <td className="px-4 py-4">{customer.phone}</td>
                <td className="px-4 py-4">{customer.email ?? "—"}</td>
                <td className="px-4 py-4">{customer.orders.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
