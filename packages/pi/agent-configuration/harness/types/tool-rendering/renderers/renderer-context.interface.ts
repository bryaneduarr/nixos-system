import type { Component } from "@earendil-works/pi-tui";

/** Render context that Pi passes to harness tool renderers; mirrors Pi's shape at the boundary. */
export interface RendererContext {
  /** Arguments of the tool call. */
  readonly args: Record<string, unknown>;
  /** Identifier of the tool call, shared by its call and result renders. */
  readonly toolCallId: string;
  /** Component Pi returned earlier for this render slot; Pi leaves it undefined before the first render. */
  readonly lastComponent: Component | undefined;
  /** Whether the tool call is still streaming. */
  readonly isPartial: boolean;
  /** Whether the tool call reported an error. */
  readonly isError: boolean;
  /** Whether the result view is expanded. */
  readonly expanded: boolean;
}
