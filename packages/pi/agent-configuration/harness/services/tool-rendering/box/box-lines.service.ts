import { boxWidth } from "./box-width.service.ts";
import { renderBox } from "./render-box.service.ts";

export function boxLines(available: number, title: string, lines: readonly string[]): string[] {
  return renderBox(title, lines, boxWidth(available, title, lines));
}
