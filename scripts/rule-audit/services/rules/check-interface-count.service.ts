import { EXPORTED_INTERFACE_PATTERN } from "../../constants/audit/export-patterns.constant.ts";
import { INTERFACE_FILE_SUFFIX } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

export function checkInterfaceCount(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  const interfaceLines = lines.filter((line) => EXPORTED_INTERFACE_PATTERN.test(line.code));
  const [, secondInterface] = interfaceLines;
  if (!file.endsWith(INTERFACE_FILE_SUFFIX) || secondInterface === undefined) return [];
  return [{ file, line: secondInterface.lineNumber, rule: "multi-interface-file" }];
}
