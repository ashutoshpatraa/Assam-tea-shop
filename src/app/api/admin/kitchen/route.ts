import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "PREPARING", "READY"] }, isSample: false },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ orders });
}
