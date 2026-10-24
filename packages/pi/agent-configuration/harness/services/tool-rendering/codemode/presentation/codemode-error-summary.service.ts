import { SCRIPT_ERROR_LABEL } from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";
import { ERROR_DETAIL_FALLBACK } from "../../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import { oneLine } from "../../text/one-line.service.ts";
import { stripScriptHeader } from "../script/strip-script-header.service.ts";

export function codemodeErrorSummary(text: string): string {
  const reason = stripScriptHeader(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "" && line !== SCRIPT_ERROR_LABEL);
  return reason === undefined ? ERROR_DETAIL_FALLBACK : oneLine(reason);
}
