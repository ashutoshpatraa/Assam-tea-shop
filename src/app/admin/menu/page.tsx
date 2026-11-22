import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function AdminMenuPage() {
  const items = await prisma.menuItem.findMany({
    include: { optionGroups: { include: { options: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return (
    <div className="p-5 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d6256]">Catalog</p>
          <h1 className="mt-1 text-[34px] text-tea">Menu</h1>
        </div>
        <a href="/admin/menu/new" className="rounded-[4px] bg-tea px-4 py-2 font-bold text-white">New item</a>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 border border-[#cbc2b3] bg-[#fffdf7] p-6 text-[#6d6256]">No menu items yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-[#cbc2b3] bg-[#fffdf7]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[#cbc2b3] bg-[#ece7dc]">
              <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Dietary</th><th className="px-4 py-3">State</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[#d9cebd]">
                  <td className="px-4 py-4 font-bold">{item.name}{item.isStarterData && <span className="ml-2 text-xs font-normal text-gamosa">Starter data</span>}</td>
                  <td className="px-4 py-4">{item.category}</td>
                  <td className="px-4 py-4">₹{(item.pricePaise / 100).toFixed(0)}</td>
                  <td className="px-4 py-4">{item.dietary === "VEG" ? "Veg" : "Non-veg"}</td>
                  <td className="px-4 py-4">{item.soldOutToday ? "Sold out" : item.active ? "Active" : "Hidden"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
