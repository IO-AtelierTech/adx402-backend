import type { RequestHandler } from "express";
import type { SolanaAddress } from "x402-express";
import { paymentMiddleware } from "x402-express";

import env from "../env";
import logger from "../utils/logger";

const RECEIVER = env.MASTER_WALLET as SolanaAddress;

type ActionHandler = (
  action: string,
  wallet: string,
  ops?: any
) => Promise<{ price: string; config?: Record<string, any> }>;

export function adx402MiddlewareFactory(
  actionHandler: ActionHandler
): RequestHandler {
  return async (req, res, next) => {
    try {
      // extract wallet (query or body)
      const wallet =
        (req.query.wallet as string) ||
        (req.body?.wallet as string) ||
        undefined;
      if (!wallet) {
        return res.status(400).json({ error: "Missing wallet parameter" });
      }

      // decide price dynamically
      logger.info(req.path)
      const { price, config } = await actionHandler(
        req.path.replace(/^\/api\//, ""), // e.g. brand/ad
        wallet,
        { method: req.method }
      );

      // create x402 payment middleware for this request
      const middleware = paymentMiddleware(RECEIVER, {
        [`${req.method} ${req.route.path}`]: {
          price,
          network: "solana-devnet",
          ...config,
        },
      });

      // run the internal middleware
      return middleware(req, res, next);
    } catch (err) {
      logger.error("adx402 middleware error:", err);
      return res.status(500).json({ error: "Internal payment middleware error" });
    }
  };
}
