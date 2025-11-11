import { createClient } from "@supabase/supabase-js";
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
    rejectUnauthorized: false,
  },
});

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY
);

export const db = drizzle(pool, { schema /* logger: true */ });
