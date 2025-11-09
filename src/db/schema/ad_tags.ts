import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core"

export const adTags = pgTable("ad_tags", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  tag: text().notNull(),
}, (table) => [
  unique("ad_tags_tag_key").on(table.tag),
]);