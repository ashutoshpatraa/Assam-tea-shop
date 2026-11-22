import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(12).max(200),
});

export async function POST(request: Request) {
  const incoming = await headers();
  const address =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    incoming.get("x-real-ip") ||
    "unknown";
  const limit = await consumeRateLimit(`admin-login:${address}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let parsed: z.infer<typeof loginSchema>;
  try {
    parsed = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const valid = await verifyAdminCredentials(parsed.email, parsed.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("Admin login unavailable", error);
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 503 });
  }
}
