import type { Request, RequestHandler } from "express";
import type { SolanaAddress } from "x402-express";
import { paymentMiddleware } from "x402-express";

import env from "../env";
import logger from "../utils/logger";

const RECEIVER = env.MASTER_WALLET as SolanaAddress;

type ActionHandler = (
  req: Request,
) => Promise<{ price: string; config: Record<string, any> }>;

export function adx402MiddlewareFactory(
  actionHandler: ActionHandler,
): RequestHandler {
  return async (req, res, next) => {
    logger.info(
      `Received payment request\nREQ: ${JSON.stringify(req.headers, null, 2)}\nQUERY: ${JSON.stringify(req.query, null, 2)}\nBODY: ${JSON.stringify(req.body, null, 2)}`,
    );
    try {
      const wallet = (req.query.wallet as string) || undefined;
      if (!wallet) {
        return res.status(400).json({ error: "Missing wallet parameter" });
      }

      // decide price dynamically
      const { price, config } = await actionHandler(req);

      // create x402 payment middleware for this request
      const middleware = paymentMiddleware(RECEIVER, {
        [`${req.method} ${req.route.path}`]: {
          price,
          network: "solana-devnet",
          config,
        },
      });

      // run the internal middleware
      return middleware(req, res, next);
    } catch (err) {
      logger.error("adx402 middleware error:", err);
      return res
        .status(500)
        .json({ error: "Internal payment middleware error" });
    }
  };
}
