import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const environmentSchema = z.object({
  DATABASE_URL: z.string().trim().min(1).default("file:../dev.db"),
  UPI_ID: optionalTrimmedString,
  UPI_PAYEE_NAME: z.string().trim().default("Assam Tea Shop"),
  ADMIN_EMAIL: optionalTrimmedString,
  ADMIN_PASSWORD_HASH: optionalTrimmedString,
  ADMIN_SESSION_SECRET: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().min(32).optional(),
    ),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_DIR: z.string().trim().min(1).default("public/uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
});

export const env = environmentSchema.parse(process.env);
