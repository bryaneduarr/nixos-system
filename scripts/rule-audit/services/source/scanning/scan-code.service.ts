import {
  BACKTICK,
  CHARACTERS_BEFORE_REGEX,
  QUOTE_CHARACTERS,
  SLASH,
  WHITESPACE,
} from "../../../constants/source/scan-characters.constant.ts";
import type { ScanState } from "../../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../../types/source/scan-step.interface.ts";
import { createScanStep } from "./create-scan-step.service.ts";

function closeTemplateExpression(state: ScanState): void {
  const innermostDepth = state.templateExpressionDepths.at(-1);
  const closesExpression = innermostDepth === state.braceDepth - 1;
  state.braceDepth -= 1;
  if (closesExpression) {
    state.templateExpressionDepths = state.templateExpressionDepths.slice(0, -1);
    state.mode = "template";
  }
}

function startsRegex(state: ScanState, character: string): boolean {
  return character === SLASH && CHARACTERS_BEFORE_REGEX.has(state.previousCodeCharacter);
}

function scanCodeCharacter(state: ScanState, character: string, nextCharacter: string): ScanStep {
  const pair = character + nextCharacter;
  if (pair === "//") {
    state.mode = "line-comment";
    return createScanStep("  ", 2);
  }
  if (pair === "/*") {
    state.mode = "block-comment";
    return createScanStep("  ", 2);
  }
  if (QUOTE_CHARACTERS.has(character)) {
    state.mode = "quoted";
    state.quote = character;
    return createScanStep(character, 1);
  }
  if (character === BACKTICK) {
    state.mode = "template";
    return createScanStep(character, 1);
  }
  if (startsRegex(state, character)) {
    state.mode = "regex";
    return createScanStep(character, 1);
  }
  if (character === "{") state.braceDepth += 1;
  if (character === "}") closeTemplateExpression(state);
  return createScanStep(character, 1);
}

export function scanCode(state: ScanState, character: string, nextCharacter: string): ScanStep {
  const scanned = scanCodeCharacter(state, character, nextCharacter);
  if (state.mode === "code" && !WHITESPACE.test(character)) state.previousCodeCharacter = character;
  return scanned;
}
