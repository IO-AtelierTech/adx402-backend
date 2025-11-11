import {
  pgTable,
  unique,
  uuid,
  text,
  foreignKey,
  inet,
  timestamp,
  boolean,
  integer,
  date,
  numeric,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adTags = pgTable(
  "ad_tags",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tag: text().notNull(),
  },
  (table) => [unique("ad_tags_tag_key").on(table.tag)],
);

export const impressions = pgTable(
  "impressions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    adId: uuid("ad_id"),
    publisherId: uuid("publisher_id"),
    slotId: uuid("slot_id"),
    viewerFingerprint: text("viewer_fingerprint"),
    viewerIp: inet("viewer_ip"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.adId],
      foreignColumns: [ads.id],
      name: "impressions_ad_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.publisherId],
      foreignColumns: [publishers.id],
      name: "impressions_publisher_id_fkey",
    }),
    foreignKey({
      columns: [table.slotId],
      foreignColumns: [adSlots.id],
      name: "impressions_slot_id_fkey",
    }),
  ],
);

export const aspectRatios = pgTable(
  "aspect_ratios",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    aspectRatio: text("aspect_ratio").notNull(),
  },
  (table) => [unique("aspect_ratios_aspect_ratio_key").on(table.aspectRatio)],
);

export const clicks = pgTable(
  "clicks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    impressionId: uuid("impression_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.impressionId],
      foreignColumns: [impressions.id],
      name: "clicks_impression_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const publishers = pgTable(
  "publishers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    walletAddress: text("wallet_address").notNull(),
    domain: text().notNull(),
    verificationToken: text("verification_token"),
    isVerified: boolean("is_verified").default(false),
    trafficScore: integer("traffic_score").default(0),
    tags: text().array(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("publishers_wallet_address_key").on(table.walletAddress),
    unique("publishers_domain_key").on(table.domain),
  ],
);

export const adSlots = pgTable(
  "ad_slots",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    publisherId: uuid("publisher_id"),
    slotId: text("slot_id").notNull(),
    tags: text().array(),
    aspectRatios: text("aspect_ratios").array(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.publisherId],
      foreignColumns: [publishers.id],
      name: "ad_slots_publisher_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const settlements = pgTable(
  "settlements",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    publisherId: uuid("publisher_id"),
    startPeriod: date("start_period").notNull(),
    endPeriod: date("end_period").notNull(),
    impressionsCount: integer("impressions_count"),
    clicksCount: integer("clicks_count"),
    rewardAmount: numeric("reward_amount", { precision: 20, scale: 8 }),
    txSignature: text("tx_signature"),
    settledAt: timestamp("settled_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.publisherId],
      foreignColumns: [publishers.id],
      name: "settlements_publisher_id_fkey",
    }),
  ],
);

export const brands = pgTable(
  "brands",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    walletAddress: text("wallet_address").notNull(),
    name: text().notNull(),
    status: text().default("active"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("brands_wallet_address_key").on(table.walletAddress),
    check(
      "brands_status_check",
      sql`status = ANY (ARRAY['active'::text, 'flagged'::text, 'banned'::text])`,
    ),
  ],
);

export const ads = pgTable(
  "ads",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    brandId: uuid("brand_id"),
    imageUrl: text("image_url").notNull(),
    targetUrl: text("target_url").notNull(),
    tags: text().array(),
    aspectRatio: text("aspect_ratio"),
    creditBalance: integer("credit_balance").default(0),
    startTime: timestamp("start_time", { mode: "string" }),
    endTime: timestamp("end_time", { mode: "string" }),
    moderationStatus: text("moderation_status").default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.brandId],
      foreignColumns: [brands.id],
      name: "ads_brand_id_fkey",
    }).onDelete("cascade"),
    check(
      "ads_moderation_status_check",
      sql`moderation_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])`,
    ),
  ],
);
