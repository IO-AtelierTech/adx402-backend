/**
 * A standardized pagination object to be included in list responses.
 * @example { "total_items": 100, "total_pages": 10, "current_page": 1, "page_size": 10, "has_more": true }
 */
export interface PaginationInfo {
  /** The total number of items available across all pages. */
  total_items: number;
  /** The total number of pages. */
  total_pages: number;
  /** The current page number being returned. */
  current_page: number;
  /** The number of items per page. */
  page_size: number;
  /** A boolean indicating if there is a next page available. */
  has_more: boolean;
}

/**
 * A standardized error object.
 * @example { "code": "RESOURCE_NOT_FOUND", "message": "The requested resource could not be found." }
 */
export interface ErrorInfo {
  /** HTTP Status returned by backend */
  status: number;
  /** A unique, machine-readable error code for client-side logic. e.g., 'CODE_EXPIRED' */
  code: string;
  /** A human-readable message describing the error. */
  message: string;
}

export class Adx402Error extends Error {
  public status: number;
  public code: string;
  public timestamp: string;

  constructor({
    status,
    code,
    message,
    timestamp = new Date().toISOString(),
  }: {
    status: number;
    code: string;
    message: string;
    timestamp?: string;
  }) {
    super(message);
    this.status = status;
    this.code = code;
    this.timestamp = timestamp;

    Object.setPrototypeOf(this, Adx402Error.prototype);
    // Maintain proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Adx402Error);
    }
  }

  public toResponse(): ErrorInfo {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
    };
  }
}

/**
 * A standardized API response wrapper.
 *
 * - On `success: true`, `data` is required and contains the payload. `error` is not present.
 * - On `success: false`, `error` is required and `data` is omitted (or null).
 *
 * This is similar to Rust's `Result<T, E>`.
 */

export type Adx402BaseResponse = { timestamp: string; success: boolean };

export type Adx402ErrorResponse = Adx402BaseResponse & {
  success: false;
  error: ErrorInfo;
};

export type Adx402SuccessResponse<T> = Adx402BaseResponse & {
  success: true;
  data: T;
};

export type Adx402Response<T> = Adx402SuccessResponse<T> | Adx402ErrorResponse;

export type Adx402PaginatedSuccessResponse<T> = Adx402BaseResponse & {
  success: true;
  data: T;
  pagination: PaginationInfo;
};

export type Adx402PaginatedResponse<T> =
  | Adx402PaginatedSuccessResponse<T>
  | Adx402ErrorResponse;

// type for a paginated result from a service
export type PaginatedResult<T> = [T, PaginationInfo];

export type Adx402AsyncResponse<T> = Promise<Adx402Response<T>>;
export type Adx402AsyncPaginatedResponse<T> = Promise<
  Adx402PaginatedResponse<T>
>;
