/**
 * Criteria used to search a stack trace for a specific frame.
 *
 * Provides either a `symbol` (function name or RegExp) or an `offset` (index in the stack),
 * along with the error or pre-collected frame stack to search in.
 *
 * @template T - The type of the error or frame collection to search.
 */
export type StackSearchCriteria<T> = {
  /**
   * The error object or a pre-collected FrameCollection to search.
   */
  error: T;

  /**
   * Optional configuration options for stack search.
   */
  options?: {
    /**
     * If true, applies Firefox-specific method resolution.
     * Firefox stack traces sometimes encode function names in file paths.
     */
    firefoxCompatibility?: boolean;
  };
} & (
  | {
      /**
       * Function name or RegExp to match in stack frames.
       * Optional if `offset` is provided.
       */
      symbol?: string | RegExp;

      /**
       * Absolute index in the stack to retrieve.
       * Required if `symbol` is omitted.
       */
      offset: number;
    }
  | {
      /**
       * Function name or RegExp to match in stack frames.
       * Required if `offset` is omitted.
       */
      symbol: string | RegExp;

      /**
       * Absolute index in the stack to retrieve.
       * Optional if `symbol` is provided.
       */
      offset?: number;
    }
);