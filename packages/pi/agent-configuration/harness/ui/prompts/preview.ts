import { wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { PREVIEW_LINES, PREVIEW_SOURCE_LIMIT } from "../../constants/prompts/preview.constant.ts";

export function previewPrompt(text: string, width: number): string {
  const contentWidth = Math.max(1, width - 4);
  const prefix = text.slice(0, PREVIEW_SOURCE_LIMIT);
  const lines = wrapTextWithAnsi(prefix, contentWidth);

  if (prefix.length === text.length && lines.length <= PREVIEW_LINES) return text;

  const preview = lines.slice(0, PREVIEW_LINES).join("\n");
  const backticks = preview.match(/`+/g) ?? [];
  const fenceLength = Math.max(3, ...backticks.map((run) => run.length + 1));
  const fence = "`".repeat(fenceLength);

  return `${fence}\n${preview}\n${fence}\n\n... Ctrl+Alt+U: full prompt · /prompts: earlier prompts`;
}
