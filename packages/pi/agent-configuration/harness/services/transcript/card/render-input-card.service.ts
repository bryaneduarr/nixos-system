import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { CARD_SIDE_CHROME_WIDTH, MIN_CARD_WIDTH } from "../../../constants/transcript/card/card-layout.constant.ts";
import { CARD_STYLES } from "../../../constants/transcript/card/card-style.constant.ts";
import { cardFrameLines } from "./card-frame-lines.service.ts";

const EDITOR_BORDER_PATTERN = /^─{3,}/;
const EDITOR_TOP_BORDER_INDEX = 0;

export function renderInputCard(width: number, renderEditor: (editorWidth: number) => string[]): string[] {
  if (width < MIN_CARD_WIDTH) return renderEditor(width);

  const editorLines = renderEditor(width - CARD_SIDE_CHROME_WIDTH);
  if (editorLines.length === 0) return editorLines;

  const bottomBorderIndex = findBottomBorderIndex(editorLines);
  const typedLines = editorLines.slice(EDITOR_TOP_BORDER_INDEX + 1, bottomBorderIndex);
  const linesBelowEditor = editorLines.slice(bottomBorderIndex + 1);
  return [...cardFrameLines(CARD_STYLES.input, typedLines.length > 0 ? typedLines : [""], width), ...linesBelowEditor];
}

function findBottomBorderIndex(editorLines: readonly string[]): number {
  const borderIndex = editorLines.findLastIndex(
    (line, index) => index > EDITOR_TOP_BORDER_INDEX && EDITOR_BORDER_PATTERN.test(stripTerminalSequences(line)),
  );
  return borderIndex < 0 ? editorLines.length - 1 : borderIndex;
}
