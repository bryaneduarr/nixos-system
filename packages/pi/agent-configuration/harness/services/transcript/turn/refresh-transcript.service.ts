import { TuiAltScreen } from "@earendil-works/pi-tui";
import { TURN_REFRESH_WIDGET_KEY } from "../../../constants/transcript/turn-view.constant.ts";
import type {
  TranscriptRefreshPosition,
  TranscriptRefreshUi,
} from "../../../types/transcript/transcript-refresh-ui.interface.ts";

export function refreshTranscript(ui: TranscriptRefreshUi, position: TranscriptRefreshPosition): void {
  ui.setWidget(TURN_REFRESH_WIDGET_KEY, (tui) => {
    if (position === "turn-start" && tui instanceof TuiAltScreen) tui.scrollToTop();
    return { render: () => [], invalidate: () => {} };
  });
  ui.setWidget(TURN_REFRESH_WIDGET_KEY, undefined);
}
