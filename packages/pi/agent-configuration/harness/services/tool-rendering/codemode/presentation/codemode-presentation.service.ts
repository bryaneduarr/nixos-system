import { CODEMODE_BOX_TITLE } from "../../../../constants/tools/active-tools/codemode.constant.ts";
import type { CodemodePresentationInput } from "../../../../types/tool-rendering/codemode/codemode-presentation-input.interface.ts";
import type { HarnessPresentation } from "../../../../types/tool-rendering/presentation/harness-presentation.interface.ts";
import { codemodeCallRows } from "./codemode-call-rows.service.ts";
import { codemodeErrorSummary } from "./codemode-error-summary.service.ts";
import { codemodeOutputRows } from "./codemode-output-rows.service.ts";
import { codemodeSuccessSummary } from "./codemode-success-summary.service.ts";
import { codemodeTarget } from "./codemode-target.service.ts";

export function codemodePresentation(input: CodemodePresentationInput): HarnessPresentation {
  const base = { title: CODEMODE_BOX_TITLE, target: codemodeTarget(input) };
  const callRows = codemodeCallRows(input.calls);
  switch (input.state) {
    case "running":
      return { ...base, state: "running", details: callRows };
    case "error":
      return { ...base, state: "error", details: [codemodeErrorSummary(input.text), ...callRows] };
    case "success":
      return {
        ...base,
        state: "success",
        details: [codemodeSuccessSummary(input.calls), ...callRows, ...codemodeOutputRows(input.text)],
      };
    default:
      return input.state satisfies never;
  }
}
