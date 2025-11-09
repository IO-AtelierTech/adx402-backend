import { foreignKey, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"

import { impressions } from "./impressions"

export const clicks = pgTable("clicks", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  impressionId: uuid("impression_id"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.impressionId],
    foreignColumns: [impressions.id],
    name: "clicks_impression_id_fkey"
  }).onDelete("cascade"),
]);
