import cron from "node-cron";

import { processPendingAds } from "../services/moderation";

// Every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("🕒 Running scheduled ad moderation job...");
  await processPendingAds();
});
