import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { expireUnpaidOrders } from "@/lib/expire-orders";

const utrSchema = z.object({
  publicId: z.string().regex(/^AT-\d{4,}$/),
  utr: z.string().trim().min(6).max(80).regex(/^[A-Za-z0-9-]+$/),
});

export async function POST(request: Request) {
  await expireUnpaidOrders();
  const incoming = await headers();
  const address =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    incoming.get("x-real-ip") ||
    "unknown";
  const limit = await consumeRateLimit(`payment:${address}`, 12, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many payment submissions. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const form = await request.formData();
  let parsed: z.infer<typeof utrSchema>;
  try {
    parsed = utrSchema.parse({
      publicId: form.get("publicId"),
      utr: form.get("utr"),
    });
  } catch {
    return NextResponse.json({ error: "Enter a valid UTR/transaction ID." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { publicId: parsed.publicId } });
  if (!order || order.isSample) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Payment cannot be submitted for this order." }, { status: 409 });
  }

  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  const expiryMinutes = settings?.orderExpiryMinutes ?? 15;
  if (order.createdAt.getTime() + expiryMinutes * 60 * 1000 < Date.now()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ error: "This order expired before payment was submitted." }, { status: 409 });
  }

  let screenshotUrl: string | undefined;
  const screenshot = form.get("screenshot");
  if (screenshot instanceof File && screenshot.size > 0) {
    if (screenshot.size > env.MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Screenshot is larger than 5 MB." }, { status: 400 });
    }
    const allowed: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = allowed[screenshot.type];
    if (!extension) {
      return NextResponse.json({ error: "Upload a JPEG, PNG or WebP screenshot." }, { status: 400 });
    }
    const bytes = Buffer.from(await screenshot.arrayBuffer());
    const directory = path.resolve(process.cwd(), env.UPLOAD_DIR);
    await mkdir(directory, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, fileName), bytes);
    screenshotUrl = `/uploads/${fileName}`;
  }

  try {
    await prisma.$transaction([
      prisma.paymentSubmission.create({
        data: {
          orderId: order.id,
          utr: parsed.utr,
          screenshotUrl,
          status: "SUBMITTED",
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_SUBMITTED" },
      }),
    ]);
  } catch (error) {
    if (String(error).includes("Unique constraint")) {
      return NextResponse.json({ error: "This UTR has already been submitted for an order." }, { status: 409 });
    }
    console.error("Payment submission failed", error);
    return NextResponse.json({ error: "Could not submit payment." }, { status: 500 });
  }

  return NextResponse.json({ accepted: true });
}
