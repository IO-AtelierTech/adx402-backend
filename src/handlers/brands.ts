import { eq } from "drizzle-orm";
import type { Request } from "express";

import { db } from "../db/client";
import { brands } from "../db/schema";

/**
 * Fetch a brand by its wallet address.
 * @param walletAddress The wallet address to look up.
 * @returns The brand record, or null if not found.
 */
export async function getWalletInfo(walletAddress: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.walletAddress, walletAddress))
    .limit(1);

  return brand ?? null;
}

export const brandAdPostHandler = async (req: Request) => {
  const action = req.path;
  if (action !== "/brand/ad") throw new Error("Invalid action");

  const wallet = req.query.wallet as string;
  const brand = await getWalletInfo(wallet);
  let price = "$0.0005"; // base fee

  // Require that a file was uploaded
  //const file = (req as any).file as Express.Multer.File | undefined;
  //if (!file || !file.buffer?.length) {
  //  throw new Error("No file uploaded — payment not required");
  //}

  // Optional: validate MIME type or size
  //if (!file.mimetype.startsWith("image/")) {
  //  throw new Error("Uploaded file must be an image");
  //}

  const config = {
    description: `Fee to post an ad as a brand`,
  };

  // Optionally, adjust price based on user or file
  if (!brand) price = "$0.001"; // higher for new accounts

  return { price, config };
};
