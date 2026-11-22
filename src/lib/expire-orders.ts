import "server-only";
import { prisma } from "@/lib/prisma";

export async function expireUnpaidOrders() {
  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  const expiryMinutes = settings?.orderExpiryMinutes ?? 15;
  const cutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);
  const expired = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      createdAt: { lt: cutoff },
      isSample: false,
    },
    include: { items: true },
  });

  for (const order of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      for (const item of order.items) {
        if (item.menuItemId && item.stockReservedQuantity > 0 && item.stockReleasedAt === null) {
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: { stockOnHand: { increment: item.stockReservedQuantity } },
          });
          await tx.orderItem.update({
            where: { id: item.id },
            data: { stockReleasedAt: new Date() },
          });
        }
      }
    });
  }
  return expired.length;
}
