import { ELLIPSIS } from "../../../constants/render/card-layout.constant.ts";

const ELLIPSIS_WIDTH = Array.from(ELLIPSIS).length;

export function truncateText(text: string, maxWidth: number): string {
  const characters = Array.from(text);
  if (characters.length <= maxWidth) return text;
  if (maxWidth <= 0) return "";
  return `${characters.slice(0, maxWidth - ELLIPSIS_WIDTH).join("")}${ELLIPSIS}`;
}
