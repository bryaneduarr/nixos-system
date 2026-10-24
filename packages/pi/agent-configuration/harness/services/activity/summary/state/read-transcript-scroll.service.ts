import { type TUI, TuiAltScreen } from "@earendil-works/pi-tui";
import type { TranscriptScroll } from "../../../../types/activity/summary/transcript-scroll.interface.ts";

const NEVER_AWAY_FROM_LATEST: TranscriptScroll = { isAwayFromLatest: () => false };

export function readTranscriptScroll(tui: TUI): TranscriptScroll {
  if (!(tui instanceof TuiAltScreen)) return NEVER_AWAY_FROM_LATEST;
  return { isAwayFromLatest: () => !tui.isFollowingOutput };
}
