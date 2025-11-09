import {
  Get,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

import type { Adx402AsyncResponse } from "../models/response";
import Adx402Controller, { createSuccessResponse } from "../utils/response";

@Route("health")
@Tags("Health Check")
export class HealthController extends Adx402Controller {
  @Get("/")
  @SuccessResponse("200", "Health check successful")
  public async checkHealth(): Adx402AsyncResponse<string> {
    return createSuccessResponse("Health check successful");
  }
}
