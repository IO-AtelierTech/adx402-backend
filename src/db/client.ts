import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "../env";
import * as schema from "./schema";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Terminate a connection attempt after 10 seconds
  ssl: {
    // change to true in production
    rejectUnauthorized: env.APP_ENV === "production" ? false : false,
    // change to whatever fits in production
    checkServerIdentity:
      env.APP_ENV === "production" ? () => undefined : () => undefined,
    ca: env.DATABASE_CERT,
  },
});

export const db = drizzle(pool, { schema /* logger: true */ });
