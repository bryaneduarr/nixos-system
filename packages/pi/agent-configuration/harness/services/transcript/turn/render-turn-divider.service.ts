import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import {
  TURN_DIVIDER_ACTION,
  TURN_DIVIDER_ARROW,
  TURN_DIVIDER_DASH,
  TURN_DIVIDER_DASH_COLOR,
  TURN_DIVIDER_DIRECTION_WORD,
  TURN_DIVIDER_KEY_COLOR,
  TURN_DIVIDER_LABEL_COLOR,
  TURN_DIVIDER_SEPARATOR,
} from "../../../constants/transcript/turn-divider.constant.ts";
import { TURN_HISTORY_TOGGLE_LABEL } from "../../../constants/transcript/turn-view.constant.ts";
import type { TurnDividerRequest, TurnDividerTheme } from "../../../types/transcript/turn/turn-divider.interface.ts";

const DASHES_PER_SIDE_MINIMUM = 2;

export function renderTurnDivider(theme: TurnDividerTheme, request: TurnDividerRequest): string[] {
  const { direction, hiddenCount, width } = request;
  const noun = hiddenCount === 1 ? "turn" : "turns";
  const summary = `${TURN_DIVIDER_ARROW[direction]} ${hiddenCount} ${TURN_DIVIDER_DIRECTION_WORD[direction]} ${noun} hidden`;
  const action = `${TURN_HISTORY_TOGGLE_LABEL} ${TURN_DIVIDER_ACTION}`;
  const labelWidth = visibleWidth(`${summary}${TURN_DIVIDER_SEPARATOR}${action}`) + 2;
  const dashCount = width - labelWidth;
  if (dashCount < DASHES_PER_SIDE_MINIMUM * 2) {
    return [theme.fg(TURN_DIVIDER_LABEL_COLOR, truncateToWidth(summary, Math.max(1, width), "", true))];
  }
  const left = Math.floor(dashCount / 2);
  const dashes = (count: number): string => theme.fg(TURN_DIVIDER_DASH_COLOR, TURN_DIVIDER_DASH.repeat(count));
  const label = [
    theme.fg(TURN_DIVIDER_LABEL_COLOR, summary),
    theme.fg(TURN_DIVIDER_DASH_COLOR, TURN_DIVIDER_SEPARATOR),
    theme.fg(TURN_DIVIDER_KEY_COLOR, action),
  ].join("");
  const line = `${dashes(left)} ${label} ${dashes(dashCount - left)}`;
  return direction === "earlier" ? [line, ""] : [line];
}
