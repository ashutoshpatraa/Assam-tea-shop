import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export const instant = false;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  if (!session) redirect("/admin-login");

  return (
    <div className="min-h-screen bg-[#f1ede5] text-[#2d261f]">
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] border-r border-[#cbc2b3] bg-[#fffdf7] px-4 py-5 md:block">
        <p className="display px-2 text-lg text-tea">Assam Tea Shop</p>
        <nav aria-label="Admin navigation" className="mt-8 grid gap-1 text-sm font-bold">
          {[
            ["/admin", "Overview"],
            ["/admin/kitchen", "Kitchen"],
            ["/admin/orders", "Orders"],
            ["/admin/menu", "Menu"],
            ["/admin/customers", "Customers"],
            ["/admin/settings", "Settings"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-[4px] px-3 py-3 hover:bg-[#ece7dc]">{label}</Link>
          ))}
        </nav>
      </aside>
      <header className="border-b border-[#cbc2b3] bg-[#fffdf7] md:ml-[220px]">
        <div className="flex items-center justify-between px-5 py-3 text-sm">
          <nav aria-label="Mobile admin navigation" className="flex gap-3 overflow-x-auto md:hidden">
            <Link href="/admin">Overview</Link>
            <Link href="/admin/kitchen">Kitchen</Link>
            <Link href="/admin/orders">Orders</Link>
          </nav>
          <span className="hidden md:inline text-muted">{session.email}</span>
        </div>
      </header>
      <main className="md:ml-[220px]">{children}</main>
    </div>
  );
}
