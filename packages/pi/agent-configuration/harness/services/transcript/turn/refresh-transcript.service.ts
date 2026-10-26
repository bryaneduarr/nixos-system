import { TuiAltScreen } from "@earendil-works/pi-tui";
import { TURN_REFRESH_WIDGET_KEY } from "../../../constants/transcript/turn/turn-view.constant.ts";
import type { TranscriptRefreshPosition } from "../../../types/transcript/turn/transcript-refresh-position.interface.ts";
import type { TranscriptRefreshUi } from "../../../types/transcript/turn/transcript-refresh-ui.interface.ts";

export function refreshTranscript(ui: TranscriptRefreshUi, position: TranscriptRefreshPosition): void {
  ui.setWidget(TURN_REFRESH_WIDGET_KEY, (tui) => {
    if (position === "turn-start" && tui instanceof TuiAltScreen) tui.scrollToTop();
    return { render: () => [], invalidate: () => {} };
  });
  ui.setWidget(TURN_REFRESH_WIDGET_KEY, undefined);
}
