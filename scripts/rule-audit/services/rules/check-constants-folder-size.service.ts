import { dirname } from "node:path";
import { MAX_CONSTANT_FILES_PER_FOLDER } from "../../constants/audit/audit-rules.constant.ts";
import { CONSTANT_FILE_SUFFIX } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { AuditedFile } from "../../types/source/audited-file.interface.ts";

export function checkConstantsFolderSize(files: readonly AuditedFile[]): readonly AuditFinding[] {
  const folders = files
    .filter((audited) => audited.file.endsWith(CONSTANT_FILE_SUFFIX))
    .map((audited) => dirname(audited.file));
  return [...new Set(folders)]
    .filter((folder) => folders.filter((candidate) => candidate === folder).length > MAX_CONSTANT_FILES_PER_FOLDER)
    .map((folder) => ({ file: folder, line: 0, rule: "crowded-constants-folder" }));
}
