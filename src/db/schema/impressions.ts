import { foreignKey, inet, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { ads } from "./ads"
import { adSlots } from "./ad_slots"
import { publishers } from "./publishers"

export const impressions = pgTable("impressions", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  adId: uuid("ad_id"),
  publisherId: uuid("publisher_id"),
  slotId: uuid("slot_id"),
  viewerFingerprint: text("viewer_fingerprint"),
  viewerIp: inet("viewer_ip"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.adId],
    foreignColumns: [ads.id],
    name: "impressions_ad_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.publisherId],
    foreignColumns: [publishers.id],
    name: "impressions_publisher_id_fkey"
  }),
  foreignKey({
    columns: [table.slotId],
    foreignColumns: [adSlots.id],
    name: "impressions_slot_id_fkey"
  }),
]);