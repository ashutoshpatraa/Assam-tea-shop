import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const menuUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  category: z.enum(["Hot Tea", "Cold Drinks", "Snacks", "Light Meals", "Packaged Tea"]).optional(),
  pricePaise: z.number().int().min(0).max(100000).optional(),
  dietary: z.enum(["VEG", "NON_VEG"]).optional(),
  active: z.boolean().optional(),
  soldOutToday: z.boolean().optional(),
  stockOnHand: z.number().int().min(0).nullable().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = menuUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid menu item details." }, { status: 400 });
  const { id } = await context.params;
  try {
    const item = await prisma.menuItem.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
  }
}
