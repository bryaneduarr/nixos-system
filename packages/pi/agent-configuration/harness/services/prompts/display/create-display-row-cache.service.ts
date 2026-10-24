import { RENDER_CACHE_LIMIT } from "../../../constants/prompts/viewer.constant.ts";
import type { DisplayRow } from "../../../types/prompts/display/display-row.interface.ts";
import type { DisplayRowCache } from "../../../types/prompts/display/display-row-cache.interface.ts";
import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import { wrapPrompt } from "./wrap-prompt.service.ts";

export function createDisplayRowCache(): DisplayRowCache {
  const rowsByWidth = new Map<number, DisplayRow[]>();
  return {
    rows(units: readonly Grapheme[], width: number): readonly DisplayRow[] {
      const cached = rowsByWidth.get(width);
      if (cached !== undefined) return cached;
      const wrapped = wrapPrompt(units, width);
      if (rowsByWidth.size >= RENDER_CACHE_LIMIT) rowsByWidth.clear();
      rowsByWidth.set(width, wrapped);
      return wrapped;
    },
    clear(): void {
      rowsByWidth.clear();
    },
  };
}
