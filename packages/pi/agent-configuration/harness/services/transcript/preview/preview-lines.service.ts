import { previewTextLines } from "./preview-text-lines.service.ts";

export function previewLines(title: string, text: string, availableWidth: number): string[] {
  return [title, ...previewTextLines(text, availableWidth)];
}
