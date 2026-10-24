import { TOP_LEVEL_FUNCTION_PATTERN } from "../../constants/audit/export-patterns.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { AuditedFile } from "../../types/source/audited-file.interface.ts";

interface FunctionDeclaration {
  readonly file: string;
  readonly line: number;
  readonly name: string;
}

function readFunctionDeclarations(files: readonly AuditedFile[]): readonly FunctionDeclaration[] {
  return files.flatMap((audited) =>
    audited.lines.flatMap((line) => {
      const match = TOP_LEVEL_FUNCTION_PATTERN.exec(line.code);
      if (match === null) return [];
      const [, functionName, arrowName] = match;
      const name = functionName ?? arrowName;
      return name === undefined ? [] : [{ file: audited.file, line: line.lineNumber, name }];
    }),
  );
}

export function findDuplicateFunctions(files: readonly AuditedFile[]): readonly AuditFinding[] {
  const declarations = readFunctionDeclarations(files);
  return declarations
    .filter((declaration) =>
      declarations.some((other) => other.name === declaration.name && other.file < declaration.file),
    )
    .map((declaration) => ({ file: declaration.file, line: declaration.line, rule: "duplicate-function" }));
}
