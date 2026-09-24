/**
 * Common ServiceResult wrapper type for all asynchronous domain service operations.
 */
export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}
