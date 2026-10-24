import {
  ARROW_PLACEHOLDER,
  ARROW_TOKEN,
  CLOSING_BRACKETS,
  OPENING_BRACKETS,
} from "../../../constants/audit/function-signature.constant.ts";

export function countPositionalParameters(parameterText: string): number {
  let depth = 0;
  let count = 0;
  let segmentHasText = false;
  for (const character of parameterText.replaceAll(ARROW_TOKEN, ARROW_PLACEHOLDER)) {
    if (OPENING_BRACKETS.includes(character)) depth += 1;
    if (CLOSING_BRACKETS.includes(character) && depth > 0) depth -= 1;
    const endsParameter = character === "," && depth === 0;
    if (endsParameter && segmentHasText) count += 1;
    if (endsParameter) segmentHasText = false;
    else if (character.trim() !== "") segmentHasText = true;
  }
  return segmentHasText ? count + 1 : count;
}
