import { GREEN_ABOVE_PERCENT, RED_AT_OR_BELOW_PERCENT } from "../../../constants/render/bar-level.constant.ts";
import { BAR_LEVEL_SGR, DIM_SGR } from "../../../constants/render/card-color.constant.ts";
import {
  BAR_CELLS,
  EMPTY_BAR_CELL,
  FILLED_BAR_CELL,
  MIN_FILLED_BAR_CELLS,
} from "../../../constants/render/card-layout.constant.ts";
import { MAX_PERCENT, MIN_PERCENT } from "../../../constants/usage/percent-range.constant.ts";
import type { BarLevel, UsageBarInput } from "../../../types/render/usage-bar.interface.ts";
import { paintText } from "./paint-text.service.ts";

function resolveBarLevel(percent: number): BarLevel {
  if (percent > GREEN_ABOVE_PERCENT) return "green";
  if (percent > RED_AT_OR_BELOW_PERCENT) return "yellow";
  return "red";
}

function countFilledCells(percent: number): number {
  const cellsForPercent = Math.round((percent * BAR_CELLS) / MAX_PERCENT);
  const isNonzeroPercent = percent > MIN_PERCENT;
  return isNonzeroPercent ? Math.max(MIN_FILLED_BAR_CELLS, cellsForPercent) : 0;
}

export function buildUsageBar(input: UsageBarInput): string {
  const filledCount = countFilledCells(input.percent);
  const filled = paintText({
    text: FILLED_BAR_CELL.repeat(filledCount),
    sgr: BAR_LEVEL_SGR[resolveBarLevel(input.percent)],
    colorEnabled: input.colorEnabled,
  });
  const empty = paintText({
    text: EMPTY_BAR_CELL.repeat(BAR_CELLS - filledCount),
    sgr: DIM_SGR,
    colorEnabled: input.colorEnabled,
  });
  return `${filled}${empty}`;
}
