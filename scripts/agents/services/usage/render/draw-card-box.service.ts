import { PROVIDER_ACCENT_SGR } from "../../../constants/render/card-color.constant.ts";
import {
  CARD_BOTTOM_LEFT,
  CARD_BOTTOM_RIGHT,
  CARD_HORIZONTAL,
  CARD_PADDING_WIDTH,
  CARD_TOP_LEFT,
  CARD_TOP_RIGHT,
  CARD_VERTICAL,
  SPACE,
} from "../../../constants/render/card-layout.constant.ts";
import type { DrawCardBoxInput } from "../../../types/render/usage-card.interface.ts";
import { padVisibleText } from "./pad-visible-text.service.ts";
import { paintText } from "./paint-text.service.ts";
import { truncateText } from "./truncate-text.service.ts";

function drawContentLine(line: string, innerWidth: number, sideBorder: string): string {
  return `${sideBorder}${SPACE}${padVisibleText(line, innerWidth)}${SPACE}${sideBorder}`;
}

export function drawCardBox(input: DrawCardBoxInput): readonly string[] {
  const { content, options } = input;
  const { colorEnabled, innerWidth } = options;
  const accentSgr = PROVIDER_ACCENT_SGR[content.provider];
  const paintAccent = (text: string): string => paintText({ text, sgr: accentSgr, colorEnabled });
  const horizontalRule = CARD_HORIZONTAL.repeat(innerWidth + CARD_PADDING_WIDTH);
  const sideBorder = paintAccent(CARD_VERTICAL);
  const titleLine = paintAccent(truncateText(content.title, innerWidth));
  const contentLines = [titleLine, "", ...content.bodyLines];
  return [
    paintAccent(`${CARD_TOP_LEFT}${horizontalRule}${CARD_TOP_RIGHT}`),
    ...contentLines.map((line) => drawContentLine(line, innerWidth, sideBorder)),
    paintAccent(`${CARD_BOTTOM_LEFT}${horizontalRule}${CARD_BOTTOM_RIGHT}`),
  ];
}
