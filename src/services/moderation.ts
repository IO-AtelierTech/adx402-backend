import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { ads } from "../db/schema/ads";
import logger from "../utils/logger";
import { moderateImage } from "../utils/visionClient";

export async function processPendingAds() {
  const pendingAds = await db
    .select()
    .from(ads)
    .where(eq(ads.moderationStatus, "pending"));

  if (pendingAds.length === 0) {
    logger.info("✅ No pending ads to moderate.");
    return;
  }

  logger.info(`🕵️ Moderating ${pendingAds.length} pending ads...`);

  for (const ad of pendingAds) {
    try {
      const result = await moderateImage(ad.imageUrl);

      const newStatus = result.approved ? "approved" : "rejected";

      await db
        .update(ads)
        .set({ moderationStatus: newStatus })
        .where(eq(ads.id, ad.id));

      if (newStatus == "rejected") {
        logger.info(
          `→ Ad ${ad.id} (${ad.imageUrl}) marked as ${newStatus} (${result.reason})`,
        );
      }
    } catch (err) {
      logger.error(`⚠️ Error moderating ad ${ad.id}:`, err);
    }
  }
}
