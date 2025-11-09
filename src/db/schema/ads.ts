import { sql } from "drizzle-orm"
import { check, foreignKey, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { brands } from "./brands"

export const aspectRatios = pgTable("aspect_ratios", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
}, (table) => [
  unique("aspect_ratios_aspect_ratio_key").on(table.aspectRatio),
]);

export const adTags = pgTable("ad_tags", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  tag: text().notNull(),
}, (table) => [
  unique("ad_tags_tag_key").on(table.tag),
]);

export const ads = pgTable("ads", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  brandId: uuid("brand_id"),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url").notNull(),
  tags: text().array(),
  aspectRatio: text("aspect_ratio"),
  creditBalance: integer("credit_balance").default(0),
  startTime: timestamp("start_time", { mode: 'string' }),
  endTime: timestamp("end_time", { mode: 'string' }),
  moderationStatus: text("moderation_status").default('pending'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.brandId],
    foreignColumns: [brands.id],
    name: "ads_brand_id_fkey"
  }).onDelete("cascade"),
  check("ads_moderation_status_check", sql`moderation_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])`),
]);
