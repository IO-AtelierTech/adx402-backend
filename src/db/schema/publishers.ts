import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

export const publishers = pgTable("publishers", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  walletAddress: text("wallet_address").notNull(),
  domain: text().notNull(),
  verificationToken: text("verification_token"),
  isVerified: boolean("is_verified").default(false),
  trafficScore: integer("traffic_score").default(0),
  tags: text().array(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("publishers_wallet_address_key").on(table.walletAddress),
  unique("publishers_domain_key").on(table.domain),
]);

