/* Text and raw details extracted from a tool renderer payload. */
export interface RendererResult {
  /* Model-visible text of the payload. */
  text: string;
  /* Raw details the tool attached to the payload. */
  details: unknown;
}
