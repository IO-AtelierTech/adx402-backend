import {
  date,
  foreignKey,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { publishers } from "./publishers";

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
