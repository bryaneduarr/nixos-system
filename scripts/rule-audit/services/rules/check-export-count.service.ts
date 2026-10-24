import { EXPORTED_DECLARATION_PATTERN } from "../../constants/audit/export-patterns.constant.ts";
import { SERVICE_FILE_SUFFIX, STORE_FILE_SUFFIX } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

export function checkExportCount(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  const isSingleExportFile = file.endsWith(SERVICE_FILE_SUFFIX) || file.endsWith(STORE_FILE_SUFFIX);
  const exportLines = lines.filter((line) => EXPORTED_DECLARATION_PATTERN.test(line.code));
  const [, secondExport] = exportLines;
  if (!isSingleExportFile || secondExport === undefined) return [];
  return [{ file, line: secondExport.lineNumber, rule: "multi-export" }];
}
