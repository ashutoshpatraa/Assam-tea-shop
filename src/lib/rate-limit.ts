import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!key.trim() || !Number.isInteger(limit) || limit < 1 || windowMs < 1) {
    throw new Error("Rate limit requires a non-empty key, positive limit, and positive window.");
  }

  const now = Date.now();
  const windowStartedAtMs = Math.floor(now / windowMs) * windowMs;
  const id = createHash("sha256").update(key).digest("hex");
  const [bucket] = await prisma.$queryRaw<
    Array<{ count: number; windowStartedAtMs: bigint }>
  >`
    INSERT INTO "RateLimitBucket" ("id", "count", "windowStartedAtMs")
    VALUES (${id}, 1, ${BigInt(windowStartedAtMs)})
    ON CONFLICT("id") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStartedAtMs" < ${BigInt(windowStartedAtMs)} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStartedAtMs" = CASE
        WHEN "RateLimitBucket"."windowStartedAtMs" < ${BigInt(windowStartedAtMs)} THEN ${BigInt(windowStartedAtMs)}
        ELSE "RateLimitBucket"."windowStartedAtMs"
      END
    RETURNING "count", "windowStartedAtMs"
  `;

  const secondsUntilReset = Math.max(
    1,
    Math.ceil((Number(bucket.windowStartedAtMs) + windowMs - now) / 1000),
  );
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: secondsUntilReset,
  };
}
