import {
  FRAME_BORDER_COLUMNS,
  HORIZONTAL_BORDER,
  VERTICAL_BORDER,
} from "../../../constants/prompts/layout.constant.ts";
import { THEME_BORDER_MUTED } from "../../../constants/prompts/theme.constant.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";
import { fitLine } from "./fit-line.service.ts";

export function frameLines(lines: readonly string[], width: number, theme: PromptTheme): string[] {
  if (width < FRAME_BORDER_COLUMNS) return lines.map((line) => fitLine(line, width));
  const innerWidth = width - FRAME_BORDER_COLUMNS;
  const border = (text: string) => theme.fg(THEME_BORDER_MUTED, text);
  const horizontalRule = HORIZONTAL_BORDER.repeat(innerWidth);
  return [
    border(`╭${horizontalRule}╮`),
    ...lines.map((line) => `${border(VERTICAL_BORDER)}${fitLine(line, innerWidth)}${border(VERTICAL_BORDER)}`),
    border(`╰${horizontalRule}╯`),
  ];
}
