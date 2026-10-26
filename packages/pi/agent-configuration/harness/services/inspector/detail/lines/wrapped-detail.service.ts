import { wrapTextWithAnsi } from "@earendil-works/pi-tui";
import type { WrappedDetailOptions } from "../../../../types/inspector/detail/wrapped-detail-options.interface.ts";
import { buildDetail } from "./build-detail.service.ts";

export function wrappedDetail({ lookup, width, theme, artifact }: WrappedDetailOptions): string[] {
  if (!lookup.found) return [];

  const lines: string[] = [];
  const details = buildDetail({ row: lookup.row, width, artifact });

  for (const detail of details) {
    if (detail.text === "") {
      lines.push("");
      continue;
    }

    const coloredText = detail.color === "plain" ? detail.text : theme.fg(detail.color, detail.text);
    const styledText = detail.bold ? theme.bold(coloredText) : coloredText;

    const wrappedLines = wrapTextWithAnsi(styledText, width);
    lines.push(...(wrappedLines.length > 0 ? wrappedLines : [""]));
  }

  return lines;
}
