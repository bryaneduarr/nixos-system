import type { CodemodeCall } from "../../../../types/tool-rendering/codemode/codemode-call.interface.ts";
import { plural } from "../../text/plural.service.ts";

export function codemodeSuccessSummary(calls: readonly CodemodeCall[]): string {
  return calls.length === 0 ? "no tool calls" : plural(calls.length, "tool call");
}
