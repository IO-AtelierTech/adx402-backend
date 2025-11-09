import dotenv from "dotenv";
import { z } from "zod";

import logger from "./utils/logger"

dotenv.config();

const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "production"], "APP_ENV is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_CERT: z
    .string()
    .optional(),
  PORT: z
    .string()
    .min(1, "PORT is required")
    .transform((val: string) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) {
        throw new Error("PORT must be a positive number");
      }
      return num;
    })
})

const _env = EnvSchema.safeParse(process.env);

if (!_env.success) {
  logger.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

const env = _env.data;
export default env
