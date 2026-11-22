import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const statusSchema = z.object({
  status: z.enum(["PAID", "PREPARING", "READY", "COMPLETED", "CANCELLED", "REFUNDED"]),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { publicId } = await context.params;
  let parsed: z.infer<typeof statusSchema>;
  try {
    parsed = statusSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const order = await prisma.order.findUnique({
    where: { publicId },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const allowed: Record<string, string[]> = {
    PAYMENT_SUBMITTED: ["PAID", "CANCELLED"],
    PAID: ["PREPARING", "CANCELLED", "REFUNDED"],
    PREPARING: ["READY", "CANCELLED", "REFUNDED"],
    READY: ["COMPLETED", "CANCELLED", "REFUNDED"],
  };
  if (parsed.status === "PAID") {
    const submission = await prisma.paymentSubmission.findFirst({
      where: { orderId: order.id, status: "SUBMITTED" },
    });
    if (!submission) return NextResponse.json({ error: "No payment submission to verify." }, { status: 409 });
  }
  if (!allowed[order.status]?.includes(parsed.status)) {
    return NextResponse.json({ error: "That status change is not allowed." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: parsed.status, notes: parsed.note ? `${order.notes ?? ""}\n${parsed.note}`.trim() : order.notes },
    }),
    ...(parsed.status === "PAID"
      ? [
          prisma.paymentSubmission.updateMany({
            where: { orderId: order.id, status: "SUBMITTED" },
            data: { status: "PAID", reviewedAt: new Date() },
          }),
        ]
      : []),
  ]);
  return NextResponse.json({ accepted: true });
}
