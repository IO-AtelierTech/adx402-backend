import type { Request } from "express";

export interface Adx402Request extends Request {
  wallet?: string;
  paymentInfo?: {
    verified: boolean;
    txHash?: string;
  };
}
