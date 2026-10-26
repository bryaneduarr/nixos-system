import { DEFINITION_KEYWORDS } from "../../../constants/tools/search/search-patterns.constant.ts";
import { escapeRegExp } from "../text/escape-reg-exp.service.ts";

function isBareIdentifier(query: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$.-]*$/.test(query.trim());
}

export function isDefinitionLine(line: string, query: string): boolean {
  if (!isBareIdentifier(query)) return false;
  const name = escapeRegExp(query.trim());
  const keyword = DEFINITION_KEYWORDS.join("|");
  const patterns = [
    new RegExp(`\\b(?:${keyword})\\s+${name}\\b`),
    new RegExp(`\\b${name}\\s*[:=]\\s*(?:async\\s*)?(?:function\\b|\\()`),
    new RegExp(`\\b${name}\\s*\\([^)]*\\)\\s*[:{]`),
  ];
  return patterns.some((pattern) => pattern.test(line));
}
