import { sql } from "drizzle-orm"
import { check, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

export const brands = pgTable("brands", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  walletAddress: text("wallet_address").notNull(),
  name: text().notNull(),
  status: text().default('active'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("brands_wallet_address_key").on(table.walletAddress),
  check("brands_status_check", sql`status = ANY (ARRAY['active'::text, 'flagged'::text, 'banned'::text])`),
]);
