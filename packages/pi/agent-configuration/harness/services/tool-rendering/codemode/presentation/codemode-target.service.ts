import {
  CODEMODE_DEFAULT_VERB,
  CODEMODE_TARGET_FALLBACK,
  CODEMODE_VERBS,
  MAX_CODEMODE_TARGET_NAMES,
} from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";
import type { CodemodePresentationInput } from "../../../../types/tool-rendering/codemode/codemode-presentation-input.interface.ts";
import { readScriptToolNames } from "../script/read-script-tool-names.service.ts";
import { displayToolName } from "./display-tool-name.service.ts";

function verbFor(toolName: string): string {
  const match = CODEMODE_VERBS.find(({ pattern }) => pattern.test(toolName));
  return match === undefined ? CODEMODE_DEFAULT_VERB : match.verb;
}

export function codemodeTarget(input: Pick<CodemodePresentationInput, "code" | "calls">): string {
  const rawNames = input.calls.length > 0 ? input.calls.map((call) => call.name) : readScriptToolNames(input.code);
  const [firstName] = rawNames;
  if (firstName === undefined) return CODEMODE_TARGET_FALLBACK;

  const names = [...new Set(rawNames.map(displayToolName))];
  const shown = names.slice(0, MAX_CODEMODE_TARGET_NAMES).join(", ");
  const hidden = names.length - MAX_CODEMODE_TARGET_NAMES;
  return `${verbFor(firstName)} ${shown}${hidden > 0 ? ` +${hidden}` : ""}`;
}
