import { getWalletInfo } from "../utils/mock";

export const brandAdPostHandler = async (action: string, wallet: string) => {
  if (action !== "brand/ad") throw new Error("Invalid action");

  const user = await getWalletInfo(wallet);
  let price = "$0.0005"; // base fee

  if (!user) {
    price = "$0.001"; // higher for new accounts
  }

  return { price };
};
