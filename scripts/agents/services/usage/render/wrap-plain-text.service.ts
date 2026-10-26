import { SPACE } from "../../../constants/render/card-layout.constant.ts";
import { measureVisibleLength } from "./measure-visible-length.service.ts";

const WHITESPACE_PATTERN = /\s+/;

const MIN_LINE_WIDTH = 1;

function splitWordToWidth(word: string, lineWidth: number): string[] {
  const characters = Array.from(word);
  const pieces: string[] = [];
  for (let start = 0; start < characters.length; start += lineWidth) {
    pieces.push(characters.slice(start, start + lineWidth).join(""));
  }
  return pieces;
}

export function wrapPlainText(text: string, width: number): readonly string[] {
  const lineWidth = Math.max(MIN_LINE_WIDTH, width);
  const words = text
    .split(WHITESPACE_PATTERN)
    .filter((word) => word !== "")
    .flatMap((word) => splitWordToWidth(word, lineWidth));
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const extendedLine = currentLine === "" ? word : `${currentLine}${SPACE}${word}`;
    if (measureVisibleLength(extendedLine) <= lineWidth) {
      currentLine = extendedLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine !== "") lines.push(currentLine);
  return lines;
}
