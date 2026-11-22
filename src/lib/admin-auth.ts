import "server-only";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { errors, SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const SESSION_COOKIE = "assam_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function sessionSecret(): Uint8Array {
  if (!env.ADMIN_SESSION_SECRET) {
    throw new Error("Admin login is unavailable: ADMIN_SESSION_SECRET is not configured.");
  }
  return new TextEncoder().encode(env.ADMIN_SESSION_SECRET);
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    throw new Error(
      "Admin login is unavailable: configure ADMIN_EMAIL and ADMIN_PASSWORD_HASH.",
    );
  }

  if (email.trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  return compare(password, env.ADMIN_PASSWORD_HASH);
}

export async function createAdminSession(): Promise<void> {
  if (!env.ADMIN_EMAIL) {
    throw new Error("Admin login is unavailable: ADMIN_EMAIL is not configured.");
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(env.ADMIN_EMAIL)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  if (!env.ADMIN_EMAIL) {
    return null;
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || payload.sub !== env.ADMIN_EMAIL) {
      return null;
    }
    return { email: payload.sub };
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      return null;
    }
    throw error;
  }
}
