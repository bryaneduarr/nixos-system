import { SCRIPT_ERROR_LABEL } from "../../../../constants/tool-rendering/codemode-display.constant.ts";
import { ERROR_DETAIL_FALLBACK } from "../../../../constants/tool-rendering/presentation-label.constant.ts";
import type { CodemodeCall } from "../../../../types/tool-rendering/codemode/codemode-call.interface.ts";
import { oneLine } from "../../text/one-line.service.ts";
import { stripScriptHeader } from "../script/strip-script-header.service.ts";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function codemodeSuccessSummary(calls: readonly CodemodeCall[]): string {
  return calls.length === 0 ? "no tool calls" : plural(calls.length, "tool call");
}

export function codemodeOutputRows(text: string): string[] {
  const output = stripScriptHeader(text);
  if (output === "") return [];
  return [`Output: ${plural(output.split(/\r?\n/).length, "line")}, ${plural(output.length, "char")}`];
}

export function codemodeErrorSummary(text: string): string {
  const reason = stripScriptHeader(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "" && line !== SCRIPT_ERROR_LABEL);
  return reason === undefined ? ERROR_DETAIL_FALLBACK : oneLine(reason);
}
