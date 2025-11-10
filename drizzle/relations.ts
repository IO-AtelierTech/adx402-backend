import { relations } from "drizzle-orm/relations";
import {
  ads,
  impressions,
  publishers,
  adSlots,
  clicks,
  settlements,
  brands,
} from "./schema";

export const impressionsRelations = relations(impressions, ({ one, many }) => ({
  ad: one(ads, {
    fields: [impressions.adId],
    references: [ads.id],
  }),
  publisher: one(publishers, {
    fields: [impressions.publisherId],
    references: [publishers.id],
  }),
  adSlot: one(adSlots, {
    fields: [impressions.slotId],
    references: [adSlots.id],
  }),
  clicks: many(clicks),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  impressions: many(impressions),
  brand: one(brands, {
    fields: [ads.brandId],
    references: [brands.id],
  }),
}));

export const publishersRelations = relations(publishers, ({ many }) => ({
  impressions: many(impressions),
  adSlots: many(adSlots),
  settlements: many(settlements),
}));

export const adSlotsRelations = relations(adSlots, ({ one, many }) => ({
  impressions: many(impressions),
  publisher: one(publishers, {
    fields: [adSlots.publisherId],
    references: [publishers.id],
  }),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  impression: one(impressions, {
    fields: [clicks.impressionId],
    references: [impressions.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  publisher: one(publishers, {
    fields: [settlements.publisherId],
    references: [publishers.id],
  }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  ads: many(ads),
}));
