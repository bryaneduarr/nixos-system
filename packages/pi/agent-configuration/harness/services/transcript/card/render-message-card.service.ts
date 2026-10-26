import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { CARD_SIDE_CHROME_WIDTH, MIN_CARD_WIDTH } from "../../../constants/transcript/card/card-layout.constant.ts";
import { CARD_STYLES } from "../../../constants/transcript/card/card-style.constant.ts";
import type { MessageCardKind } from "../../../types/transcript/card/card-kind.interface.ts";
import { cardFrameLines } from "./card-frame-lines.service.ts";

export function renderMessageCard(
  kind: MessageCardKind,
  width: number,
  renderContent: (contentWidth: number) => string[],
): string[] {
  if (width < MIN_CARD_WIDTH) return renderContent(width);

  const contentLines = trimBlankEdgeLines(renderContent(width - CARD_SIDE_CHROME_WIDTH));
  if (contentLines.length === 0) return [];
  return cardFrameLines(CARD_STYLES[kind], contentLines, width);
}

function trimBlankEdgeLines(lines: readonly string[]): string[] {
  const isFilled = (line: string): boolean => stripTerminalSequences(line).trim() !== "";
  const first = lines.findIndex(isFilled);
  const last = lines.findLastIndex(isFilled);
  return first < 0 ? [] : lines.slice(first, last + 1);
}
