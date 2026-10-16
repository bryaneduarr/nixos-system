import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export function fitLine(text: string, width: number): string {
  const columns = Math.max(0, width);
  const clipped = truncateToWidth(text, columns, "", true);
  return clipped + " ".repeat(Math.max(0, columns - visibleWidth(clipped)));
}
