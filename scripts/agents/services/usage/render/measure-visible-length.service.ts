import { ANSI_SGR_PATTERN } from "../../../constants/render/card-color.constant.ts";

export function measureVisibleLength(text: string): number {
  return Array.from(text.replace(ANSI_SGR_PATTERN, "")).length;
}
