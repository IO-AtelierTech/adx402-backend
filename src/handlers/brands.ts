import type { Request } from "express";

import { getWalletInfo } from "../utils/mock";

export const brandAdPostHandler = async (req: Request) => {
  const action = req.path;
  if (action !== "/brand/ad") throw new Error("Invalid action");

  const wallet = req.query.wallet as string;
  const user = await getWalletInfo(wallet);
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
  if (!user) price = "$0.001"; // higher for new accounts

  return { price, config };
};
