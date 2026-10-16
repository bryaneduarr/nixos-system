/** Terminal host that a prompt browser reads its size from and asks to redraw. */
export interface PromptBrowserHost {
  /** Terminal dimensions used to size the browser. */
  readonly terminal: {
    /** Number of terminal rows available. */
    readonly rows: number;
  };
  /** Requests a redraw after the browser state changes. */
  requestRender(): void;
}
