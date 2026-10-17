import { readdirSync } from "node:fs";
import { sep } from "node:path";
import {
  DECLARATION_FILE_SUFFIX,
  IGNORED_DIRECTORY_NAMES,
  TYPESCRIPT_EXTENSION,
} from "../../constants/audit/audit-rules.constant.ts";

function isInIgnoredDirectory(relativePath: string): boolean {
  const pathParts = relativePath.split(sep);
  return IGNORED_DIRECTORY_NAMES.some((directoryName) => pathParts.includes(directoryName));
}

export function listTypescriptFiles(projectDirectory: string): readonly string[] {
  return readdirSync(projectDirectory, { recursive: true, encoding: "utf8" })
    .filter((relativePath) => {
      const isTypescript = relativePath.endsWith(TYPESCRIPT_EXTENSION);
      const isDeclaration = relativePath.endsWith(DECLARATION_FILE_SUFFIX);
      return isTypescript && !isDeclaration && !isInIgnoredDirectory(relativePath);
    })
    .sort();
}
