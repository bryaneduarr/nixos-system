import { visibleWidth } from "@earendil-works/pi-tui";

export function padCell(text: string, width: number): string {
  const missing = width - visibleWidth(text);
  return missing > 0 ? `${text}${" ".repeat(missing)}` : text;
}
