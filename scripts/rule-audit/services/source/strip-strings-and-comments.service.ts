import type { ScanState } from "../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../types/source/scan-step.interface.ts";
import { scanBlockComment } from "./scanning/scan-block-comment.service.ts";
import { scanCode } from "./scanning/scan-code.service.ts";
import { scanLineComment } from "./scanning/scan-line-comment.service.ts";
import { scanQuoted } from "./scanning/scan-quoted.service.ts";
import { scanRegex } from "./scanning/scan-regex.service.ts";
import { scanTemplate } from "./scanning/scan-template.service.ts";

function scanCharacter(state: ScanState, character: string, nextCharacter: string): ScanStep {
  switch (state.mode) {
    case "code":
      return scanCode(state, character, nextCharacter);
    case "line-comment":
      return scanLineComment(state, character);
    case "block-comment":
      return scanBlockComment(state, character, nextCharacter);
    case "quoted":
      return scanQuoted(state, character, nextCharacter);
    case "template":
      return scanTemplate(state, character, nextCharacter);
    case "regex":
      return scanRegex(state, character, nextCharacter);
    default: {
      const unhandledMode: never = state.mode;
      throw new Error(`Unhandled scan mode: ${unhandledMode}`);
    }
  }
}

export function stripStringsAndComments(sourceText: string): string {
  const state: ScanState = {
    mode: "code",
    quote: "",
    braceDepth: 0,
    previousCodeCharacter: "",
    inCharacterClass: false,
    templateExpressionDepths: [],
  };
  const output: string[] = [];
  let index = 0;
  while (index < sourceText.length) {
    const scanned = scanCharacter(state, sourceText.charAt(index), sourceText.charAt(index + 1));
    output.push(scanned.replacement);
    index += scanned.consumed;
  }
  return output.join("");
}
