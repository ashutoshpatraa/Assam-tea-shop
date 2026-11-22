import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";

const cartItemSchema = z.object({
  menuItemId: z.string().cuid(),
  quantity: z.number().int().min(1).max(6),
  customizations: z.record(z.string(), z.array(z.string())).default({}),
});

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  email: z.string().trim().email().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  orderType: z.enum(["DINE_IN", "PICKUP", "DELIVERY"]),
  tableNumber: z.string().trim().min(1).max(20).optional(),
  pickupAt: z.string().datetime().optional(),
  deliveryAddress: z.string().trim().min(10).max(500).optional(),
  items: z.array(cartItemSchema).min(1).max(30),
});

export async function POST(request: Request) {
  const incoming = await headers();
  const address =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    incoming.get("x-real-ip") ||
    "unknown";
  const limit = await consumeRateLimit(`checkout:${address}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let parsed: z.infer<typeof orderSchema>;
  try {
    parsed = orderSchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof z.ZodError ? "Please check the order details." : "Invalid request." },
      { status: 400 },
    );
  }

  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  if (
    !settings?.shopOpen ||
    !settings.businessConfigured ||
    !(settings.upiId || env.UPI_ID)
  ) {
    return NextResponse.json(
      { error: "The shop is not accepting live orders right now." },
      { status: 409 },
    );
  }
  if (parsed.orderType === "DINE_IN" && !parsed.tableNumber) {
    return NextResponse.json({ error: "Table number is required." }, { status: 400 });
  }
  if (parsed.orderType === "PICKUP" && !parsed.pickupAt) {
    return NextResponse.json({ error: "Pickup time is required." }, { status: 400 });
  }
  if (parsed.orderType === "DELIVERY" && !settings.deliveryEnabled) {
    return NextResponse.json({ error: "Delivery is not enabled." }, { status: 400 });
  }
  if (parsed.orderType === "DELIVERY" && !parsed.deliveryAddress) {
    return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let subtotalPaise = 0;
      const orderItems = [];

      for (const cartItem of parsed.items) {
        const item = await tx.menuItem.findUnique({
          where: { id: cartItem.menuItemId },
          include: { optionGroups: { include: { options: true } } },
        });
        if (!item || !item.active || item.soldOutToday) {
          throw new Error(`Unavailable: ${item?.name ?? "item"}`);
        }
        if (item.stockOnHand !== null && item.stockOnHand < cartItem.quantity) {
          throw new Error(`Unavailable: ${item.name}`);
        }

        let unitPricePaise = item.pricePaise;
        const customizations = [];
        for (const group of item.optionGroups) {
          const selectedIds = cartItem.customizations[group.id] ?? [];
          if (group.required && selectedIds.length < group.minSelect) {
            throw new Error(`Choose ${group.name} for ${item.name}`);
          }
          if (selectedIds.length > group.maxSelect) {
            throw new Error(`Too many choices for ${group.name}`);
          }
          for (const optionId of selectedIds) {
            const option = group.options.find((entry) => entry.id === optionId && entry.active);
            if (!option) throw new Error(`Invalid option for ${item.name}`);
            unitPricePaise += option.priceDeltaPaise;
            customizations.push({ group: group.name, option: option.name });
          }
        }

        if (item.stockOnHand !== null) {
          await tx.menuItem.update({
            where: { id: item.id },
            data: { stockOnHand: { decrement: cartItem.quantity } },
          });
        }
        subtotalPaise += unitPricePaise * cartItem.quantity;
        orderItems.push({
          menuItemId: item.id,
          nameSnapshot: item.name,
          unitPricePaise,
          quantity: cartItem.quantity,
          dietarySnapshot: item.dietary,
          customizationsJson: JSON.stringify(customizations),
          stockReservedQuantity: item.stockOnHand === null ? 0 : cartItem.quantity,
        });
      }

      const deliveryFeePaise =
        parsed.orderType === "DELIVERY" ? settings.deliveryFeePaise : 0;
      const totalPaise = subtotalPaise + deliveryFeePaise;

      const counter = await tx.orderCounter.update({
        where: { id: "orders" },
        data: { nextValue: { increment: 1 } },
      });
      const publicId = `AT-${String(counter.nextValue - 1).padStart(4, "0")}`;

      const customer = await tx.customer.upsert({
        where: { phone: parsed.phone },
        create: { name: parsed.name, phone: parsed.phone, email: parsed.email },
        update: { name: parsed.name, email: parsed.email ?? undefined },
      });
      const pickupAt = parsed.pickupAt ? new Date(parsed.pickupAt) : null;

      return tx.order.create({
        data: {
          publicId,
          customerId: customer.id,
          status: "PENDING_PAYMENT",
          orderType: parsed.orderType,
          tableNumber: parsed.tableNumber,
          pickupAt,
          deliveryAddress: parsed.deliveryAddress,
          notes: parsed.notes,
          subtotalPaise,
          deliveryFeePaise,
          totalPaise,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ publicId: result.publicId, totalPaise: result.totalPaise }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the order.";
    if (/Unavailable|Choose|Too many|Invalid option/.test(message)) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Could not create the order." }, { status: 500 });
  }
}
