import { foreignKey, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { publishers } from "./publishers"

export const adSlots = pgTable("ad_slots", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  publisherId: uuid("publisher_id"),
  slotId: text("slot_id").notNull(),
  tags: text().array(),
  aspectRatios: text("aspect_ratios").array(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.publisherId],
    foreignColumns: [publishers.id],
    name: "ad_slots_publisher_id_fkey"
  }).onDelete("cascade"),
]);