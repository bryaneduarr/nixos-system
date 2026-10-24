import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { THEME_ACCENT, THEME_MUTED, THEME_WARNING } from "../../../constants/split-view/theme-color.constant.ts";
import { DOT_SEPARATOR } from "../../../constants/text/separator.constant.ts";
import {
  TURN_DIVIDER_ACTION,
  TURN_DIVIDER_ARROW,
  TURN_DIVIDER_DASH,
  TURN_DIVIDER_DIRECTION_WORD,
} from "../../../constants/transcript/turn/turn-divider.constant.ts";
import { TURN_HISTORY_TOGGLE_LABEL } from "../../../constants/transcript/turn/turn-view.constant.ts";
import type { SplitViewTheme } from "../../../types/split-view/split-view-theme.interface.ts";
import type { TurnDividerRequest } from "../../../types/transcript/turn/turn-divider.interface.ts";

const DASHES_PER_SIDE_MINIMUM = 2;

export function renderTurnDivider(theme: Pick<SplitViewTheme, "fg">, request: TurnDividerRequest): string[] {
  const { direction, hiddenCount, width } = request;
  const noun = hiddenCount === 1 ? "turn" : "turns";
  const summary = `${TURN_DIVIDER_ARROW[direction]} ${hiddenCount} ${TURN_DIVIDER_DIRECTION_WORD[direction]} ${noun} hidden`;
  const action = `${TURN_HISTORY_TOGGLE_LABEL} ${TURN_DIVIDER_ACTION}`;
  const labelWidth = visibleWidth(`${summary}${DOT_SEPARATOR}${action}`) + 2;
  const dashCount = width - labelWidth;
  if (dashCount < DASHES_PER_SIDE_MINIMUM * 2) {
    return [theme.fg(THEME_ACCENT, truncateToWidth(summary, Math.max(1, width), "", true))];
  }
  const left = Math.floor(dashCount / 2);
  const dashes = (count: number): string => theme.fg(THEME_MUTED, TURN_DIVIDER_DASH.repeat(count));
  const label = [
    theme.fg(THEME_ACCENT, summary),
    theme.fg(THEME_MUTED, DOT_SEPARATOR),
    theme.fg(THEME_WARNING, action),
  ].join("");
  const line = `${dashes(left)} ${label} ${dashes(dashCount - left)}`;
  return direction === "earlier" ? [line, ""] : [line];
}
