import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

export const aspectRatios = pgTable(
  "aspect_ratios",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    aspectRatio: text("aspect_ratio").notNull(),
  },
  (table) => [unique("aspect_ratios_aspect_ratio_key").on(table.aspectRatio)],
);
