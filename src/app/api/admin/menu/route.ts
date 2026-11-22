import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(1).max(500),
  category: z.enum(["Hot Tea", "Cold Drinks", "Snacks", "Light Meals", "Packaged Tea"]),
  pricePaise: z.number().int().min(0).max(100000),
  dietary: z.enum(["VEG", "NON_VEG"]),
  active: z.boolean().default(true),
  soldOutToday: z.boolean().default(false),
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid menu item details." }, { status: 400 });
  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  try {
    const item = await prisma.menuItem.create({ data: { ...parsed.data, slug } });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An item with this name already exists." }, { status: 409 });
  }
}
