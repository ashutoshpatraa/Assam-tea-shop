import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const rejectSchema = z.object({ note: z.string().trim().max(500).optional() });

export async function POST(
  request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const parsed = rejectSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid rejection note." }, { status: 400 });
  const { publicId } = await context.params;
  const order = await prisma.order.findUnique({ where: { publicId }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!["PENDING_PAYMENT", "PAYMENT_SUBMITTED"].includes(order.status)) {
    return NextResponse.json({ error: "This payment cannot be rejected." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentSubmission.updateMany({
      where: { orderId: order.id, status: "SUBMITTED" },
      data: { status: "REJECTED", reviewedAt: new Date(), verificationNote: parsed.data.note },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", notes: parsed.data.note ? `${order.notes ?? ""}\n${parsed.data.note}`.trim() : order.notes },
    });
    for (const item of order.items) {
      if (item.menuItemId && item.stockReservedQuantity > 0) {
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: { stockOnHand: { increment: item.stockReservedQuantity } },
        });
      }
    }
  });
  return NextResponse.json({ accepted: true });
}
