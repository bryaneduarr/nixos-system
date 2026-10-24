/** Cache state of a tool box between renders. */
export type ToolBoxCache = StaleToolBoxCache | RenderedToolBoxCache;

/** The next render must compute its lines. */
interface StaleToolBoxCache {
  /** Marks that no rendered lines are kept. */
  readonly state: "stale";
}

/** Lines rendered at one width. */
interface RenderedToolBoxCache {
  /** Marks that rendered lines are kept. */
  readonly state: "rendered";
  /** Terminal width the lines were rendered at. */
  readonly width: number;
  /** Rendered box lines. */
  readonly lines: readonly string[];
}
