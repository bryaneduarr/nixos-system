import {
  CODEMODE_CALL_ICONS,
  MAX_CODEMODE_CALL_ROWS,
} from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";
import type { CodemodeCall } from "../../../../types/tool-rendering/codemode/codemode-call.interface.ts";
import { displayToolName } from "./display-tool-name.service.ts";

function durationLabel(call: CodemodeCall): string {
  if (call.durationMs.state === "absent") return "";
  return ` ${(call.durationMs.value / 1000).toFixed(1)} s`;
}

export function codemodeCallRows(calls: readonly CodemodeCall[]): string[] {
  const rows = calls
    .slice(0, MAX_CODEMODE_CALL_ROWS)
    .map((call) => `${CODEMODE_CALL_ICONS[call.status]} ${displayToolName(call.name)}${durationLabel(call)}`);
  const hidden = calls.length - MAX_CODEMODE_CALL_ROWS;
  return hidden > 0 ? [...rows, `+${hidden} more calls`] : rows;
}
