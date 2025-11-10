import type { Request as ExRequest } from "express";
import { Controller } from "tsoa";

import type {
  Adx402AsyncPaginatedResponse,
  Adx402AsyncResponse,
  Adx402PaginatedResponse,
  Adx402Response,
  ErrorInfo,
  PaginatedResult,
  PaginationInfo,
} from "../models/response";
import { Adx402Error } from "../models/response";

/**
 * Creates a standardized success response object.
 * This function should be used for all successful non-paginated API responses (e.g., HTTP 200, 201).
 *
 * @template T The type of the data payload.
 * @param {T} data - The main data payload to be returned to the client.
 * @returns {Adx402Response<T>} A standardized success response object.
 */
export function createSuccessResponse<T>(data: T): Adx402Response<T> {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Creates a standardized success response object.
 * This function should be used for all successful paginated API responses (e.g., HTTP 200, 201).
 *
 * @template T The type of the data payload.
 * @param {T} data - The main data payload to be returned to the client.
 * @param {PaginationInfo} [pagination] - Optional. Pagination details for list-based responses.
 * @returns {Adx402Response<T>} A standardized success response object.
 */
export function createPaginatedSuccessResponse<T>(
  data: T,
  pagination: PaginationInfo,
): Adx402PaginatedResponse<T> {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data,
    pagination,
  };
}

/**
 * Creates a standardized error response object.
 * This function should be used for all client or server-side non-paginated errors (e.g., HTTP 4xx, 5xx).
 *
 * @param {ErrorInfo} errorInfo - An object containing the error code and message.
 * @returns {Adx402Response<null>} A standardized error response object with a null data payload.
 */
export function createErrorResponse(
  errorInfo: ErrorInfo,
): Adx402Response<never> {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: errorInfo,
  };
}

/**
 * Creates a standardized error response object.
 * This function should be used for all client or server-side paginated errors (e.g., HTTP 4xx, 5xx).
 *
 * @param {ErrorInfo} errorInfo - An object containing the error code and message.
 * @returns {Adx402Response<null>} A standardized error response object with a null data payload.
 */
export function createPaginatedErrorResponse(
  errorInfo: ErrorInfo,
): Adx402PaginatedResponse<never> {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: errorInfo,
  };
}

/**
 * An extended TSOA Controller with standardized error handling and execution logic.
 */
export default class Adx402Controller extends Controller {
  protected async asyncExecute<T>(
    req: ExRequest,
    handler: () => Promise<T>,
  ): Adx402AsyncResponse<T> {
    try {
      const result = await handler();
      return createSuccessResponse(result);
    } catch (err: any) {
      if (err instanceof Adx402Error) {
        this.setStatus(err.status);
        return createErrorResponse(err.toResponse());
      } else {
        const status = 500;
        this.setStatus(status);
        return createErrorResponse({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error occurred at '${req.route.path}': ${err.message || "Unknown error"}'`,
          status,
        });
      }
    }
  }

  // method for paginated routes
  protected async asyncExecutePaginated<T>(
    req: ExRequest,
    handler: () => Promise<PaginatedResult<T>>,
  ): Adx402AsyncPaginatedResponse<T> {
    try {
      const [data, pagination] = await handler();
      return createPaginatedSuccessResponse(data, pagination);
    } catch (err: any) {
      if (err instanceof Adx402Error) {
        this.setStatus(err.status);
        return createPaginatedErrorResponse(err.toResponse());
      } else {
        const status = 500;
        this.setStatus(status);
        return createPaginatedErrorResponse({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error occurred at '${req.route.path}': ${err.message || "Unknown error"}'`,
          status,
        });
      }
    }
  }
}

export function getPaginationInfo({
  page,
  page_size,
  total_items,
}: {
  page: number;
  page_size: number;
  total_items: number;
}): PaginationInfo {
  const total_pages = Math.ceil(total_items / page_size);
  return {
    total_items,
    total_pages,
    current_page: page,
    page_size,
    has_more: page < total_pages,
  };
}
