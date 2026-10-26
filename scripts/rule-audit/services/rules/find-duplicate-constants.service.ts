import {
  EXPORTED_CONSTANT_PATTERN,
  MIN_DUPLICATE_TEXT_LENGTH,
} from "../../constants/audit/export-patterns.constant.ts";
import { CONSTANT_FILE_SUFFIX } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { AuditedFile } from "../../types/source/audited-file.interface.ts";

interface ConstantDeclaration {
  readonly file: string;
  readonly line: number;
  readonly name: string;
  readonly value: string;
}

function readConstantDeclarations(files: readonly AuditedFile[]): readonly ConstantDeclaration[] {
  return files
    .filter((audited) => audited.file.endsWith(CONSTANT_FILE_SUFFIX))
    .flatMap((audited) =>
      audited.lines.flatMap((line) => {
        const match = EXPORTED_CONSTANT_PATTERN.exec(line.original);
        if (match === null) return [];
        const [, name, value] = match;
        return name === undefined || value === undefined
          ? []
          : [{ file: audited.file, line: line.lineNumber, name, value }];
      }),
    );
}

function isDecorativeText(value: string): boolean {
  const text = value.slice(1, -1);
  return /^["']/.test(value) && text.length >= MIN_DUPLICATE_TEXT_LENGTH && /[^\w-]/.test(text);
}

function repeatsElsewhere(declaration: ConstantDeclaration, declarations: readonly ConstantDeclaration[]): boolean {
  return declarations.some(
    (other) =>
      other.file < declaration.file &&
      (other.name === declaration.name || (isDecorativeText(declaration.value) && other.value === declaration.value)),
  );
}

export function findDuplicateConstants(files: readonly AuditedFile[]): readonly AuditFinding[] {
  const declarations = readConstantDeclarations(files);
  return declarations
    .filter((declaration) => repeatsElsewhere(declaration, declarations))
    .map((declaration) => ({ file: declaration.file, line: declaration.line, rule: "duplicate-constant" }));
}
