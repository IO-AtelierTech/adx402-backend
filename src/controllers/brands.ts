import {
  Controller,
  Middlewares,
  Post,
  Query,
  Request,
  Route,
  SuccessResponse,
  UploadedFile,
} from "tsoa";

import { brandAdPostHandler } from "../handlers/brands";
import { adx402MiddlewareFactory } from "../middlewares/Adx402Payment";
import type { Adx402Request } from "../models/request";

@Route("brand")
export class BrandController extends Controller {
  /**
   * Endpoint for brand to upload an ad (requires dynamic micropayment)
   */
  @Post("ad")
  @Middlewares([adx402MiddlewareFactory(brandAdPostHandler)])
  @SuccessResponse("201", "Ad created")
  public async uploadAd(
    @Request() req: Adx402Request,
    @Query() wallet: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; fileName: string }> {
    console.log("Ad uploaded by wallet:", req.query.wallet);

    // Example image payload handling
    if (!file) throw new Error("Missing file");

    // Simulate saving ad...
    return {
      message: "Ad successfully uploaded!",
      fileName: file.originalname,
    };
  }
}
