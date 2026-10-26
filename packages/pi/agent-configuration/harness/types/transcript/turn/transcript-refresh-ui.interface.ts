import type { Component, TUI } from "@earendil-works/pi-tui";

/** Interface operation that makes Pi redraw the transcript. */
export interface TranscriptRefreshUi {
  /** Sets or removes a widget, which makes Pi redraw its screen and hands the widget the screen. */
  setWidget(key: string, content: ((tui: TUI) => Component) | undefined): void;
}
