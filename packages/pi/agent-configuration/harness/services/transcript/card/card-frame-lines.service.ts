import {
  backgroundAnsi,
  foregroundAnsi,
  getTerminalColorMode,
  parseColor,
  styleText,
  type TerminalColorMode,
  truncateToWidth,
  visibleWidth,
} from "@earendil-works/pi-tui";
import { CARD_SIDE_CHROME_WIDTH } from "../../../constants/transcript/card/card-layout.constant.ts";
import { CARD_BASE_TEXT_COLOR } from "../../../constants/transcript/card/card-style.constant.ts";
import type { CardStyle } from "../../../types/transcript/card/card-style.interface.ts";
import type { CardTint } from "../../../types/transcript/card/card-tint.interface.ts";

const RESET_STYLE = "\x1b[0m";
const FOREGROUND_RESET = "\x1b[39m";
const BACKGROUND_RESET = "\x1b[49m";
const BOTTOM_CORNER_COUNT = 2;

export function cardFrameLines(style: CardStyle, bodyLines: readonly string[], width: number): string[] {
  const mode = getTerminalColorMode();
  const paintBorder = (text: string): string => styleText(text, { fg: parseColor(style.borderColor) }, mode);
  const title = styleText(style.title, { fg: parseColor(style.titleColor), bold: true }, mode);
  const contentWidth = width - CARD_SIDE_CHROME_WIDTH;
  const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical } = style.frame;
  const titleFillWidth = Math.max(
    0,
    width - visibleWidth(topLeft) - visibleWidth(style.title) - visibleWidth(topRight),
  );
  const verticalRule = paintBorder(vertical);
  const baseTextStart = foregroundAnsi(parseColor(CARD_BASE_TEXT_COLOR), mode);
  const withBaseText = (line: string): string =>
    `${baseTextStart}${line.replaceAll(FOREGROUND_RESET, `${FOREGROUND_RESET}${baseTextStart}`)}`;

  const top = [paintBorder(topLeft), title, paintBorder(`${horizontal.repeat(titleFillWidth)}${topRight}`)].join("");
  const body = bodyLines.map(
    (line) =>
      `${verticalRule} ${withBaseText(truncateToWidth(line, contentWidth, "", true))}${RESET_STYLE} ${verticalRule}`,
  );
  const bottom = paintBorder(`${bottomLeft}${horizontal.repeat(width - BOTTOM_CORNER_COUNT)}${bottomRight}`);

  return [top, ...body, bottom].map(createRowTinter(style.tint, mode));
}

function createRowTinter(tint: CardTint, mode: TerminalColorMode): (row: string) => string {
  if (tint.tintState === "plain") return (row) => row;
  const backgroundStart = backgroundAnsi(parseColor(tint.color), mode);
  return (row) => {
    const withBackgroundKept = row
      .replaceAll(RESET_STYLE, `${RESET_STYLE}${backgroundStart}`)
      .replaceAll(BACKGROUND_RESET, `${BACKGROUND_RESET}${backgroundStart}`);
    return `${backgroundStart}${withBackgroundKept}${RESET_STYLE}`;
  };
}
