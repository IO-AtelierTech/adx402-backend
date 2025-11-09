import { date, foreignKey, inet, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { ads } from "./ads"
import { publishers } from "./publishers"

export const settlements = pgTable("settlements", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  publisherId: uuid("publisher_id"),
  startPeriod: date("start_period").notNull(),
  endPeriod: date("end_period").notNull(),
  impressionsCount: integer("impressions_count"),
  clicksCount: integer("clicks_count"),
  rewardAmount: numeric("reward_amount", { precision: 20, scale: 8 }),
  txSignature: text("tx_signature"),
  settledAt: timestamp("settled_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.publisherId],
    foreignColumns: [publishers.id],
    name: "settlements_publisher_id_fkey"
  }),
]);

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
