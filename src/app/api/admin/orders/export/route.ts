import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { isSample: false },
    include: { customer: true, paymentSubmissions: true },
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    ["order_id", "created_at", "status", "order_type", "customer_name", "phone", "total_inr", "utr"],
    ...orders.map((order) => [
      order.publicId,
      order.createdAt.toISOString(),
      order.status,
      order.orderType,
      order.customer.name,
      order.customer.phone,
      (order.totalPaise / 100).toFixed(2),
      order.paymentSubmissions.map((payment) => payment.utr).join(";"),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="assam-tea-orders.csv"',
    },
  });
}
