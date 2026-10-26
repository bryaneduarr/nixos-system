import { DEFAULT_READ_LINES } from "../../../constants/tools/read/read-limits.constant.ts";
import type { ReadParameters } from "../../../types/tools/read/read-parameters.interface.ts";
import type { ReadSelection } from "../../../types/tools/read/read-request.interface.ts";

export function toReadSelection(params: ReadParameters): ReadSelection {
  const symbol = params.symbol;
  if (symbol !== undefined && symbol.trim() !== "") {
    return { kind: "symbol", symbol };
  }
  const isAutomatic = params.offset === undefined && params.limit === undefined;
  if (isAutomatic) {
    return { kind: "automatic" };
  }
  return {
    kind: "lines",
    startLine: Math.max(1, params.offset ?? 1),
    lineCount: Math.max(1, params.limit ?? DEFAULT_READ_LINES),
  };
}
