import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getAdminSession } from "@/lib/admin-auth";

const settingsSchema = z.object({
  shopOpen: z.boolean(),
  businessConfigured: z.boolean(),
  address: z.string().trim().max(300),
  mapUrl: z.string().trim().url().or(z.literal("")).optional(),
  upiId: z.string().trim().max(200),
  payeeName: z.string().trim().min(2).max(100),
  deliveryEnabled: z.boolean(),
  deliveryFeePaise: z.number().int().min(0).max(100000),
  orderExpiryMinutes: z.number().int().min(5).max(1440),
  pickupIntervalMinutes: z.number().int().min(5).max(240),
  openingHours: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    openMinute: z.number().int().min(0).max(1439).nullable(),
    closeMinute: z.number().int().min(0).max(1439).nullable(),
  })).length(7).optional(),
});

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the settings values." }, { status: 400 });
  const data = parsed.data;
  const settings = await prisma.businessSettings.update({
    where: { id: "default" },
    data: {
      shopOpen: data.shopOpen,
      businessConfigured: data.businessConfigured,
      address: data.address,
      mapUrl: data.mapUrl || null,
      upiId: data.upiId,
      payeeName: data.payeeName,
      deliveryEnabled: data.deliveryEnabled,
      deliveryFeePaise: data.deliveryFeePaise,
      orderExpiryMinutes: data.orderExpiryMinutes,
      pickupIntervalMinutes: data.pickupIntervalMinutes,
    },
  });
  if (data.openingHours) {
    for (const hours of data.openingHours) {
      await prisma.openingHour.upsert({
        where: { settingsId_weekday: { settingsId: "default", weekday: hours.weekday } },
        create: { settingsId: "default", ...hours },
        update: hours,
      });
    }
  }
  return NextResponse.json({ settings });
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "default" },
    include: { openingHours: { orderBy: { weekday: "asc" } } },
  });
  if (!settings) return NextResponse.json({ error: "Settings not found." }, { status: 404 });
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const form = await request.formData();
  const qr = form.get("qr");
  if (!(qr instanceof File) || qr.size === 0) {
    return NextResponse.json({ error: "Choose a QR image." }, { status: 400 });
  }
  if (qr.size > env.MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "QR image is larger than 5 MB." }, { status: 400 });
  }
  const extension = qr.type === "image/png" ? "png" : qr.type === "image/jpeg" ? "jpg" : qr.type === "image/webp" ? "webp" : "";
  if (!extension) return NextResponse.json({ error: "Upload PNG, JPEG or WebP." }, { status: 400 });
  const directory = path.resolve(process.cwd(), env.UPLOAD_DIR);
  await mkdir(directory, { recursive: true });
  const fileName = `qr-${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, fileName), Buffer.from(await qr.arrayBuffer()));
  await prisma.businessSettings.update({
    where: { id: "default" },
    data: { staticQrUrl: `/uploads/${fileName}` },
  });
  return NextResponse.json({ staticQrUrl: `/uploads/${fileName}` });
}
