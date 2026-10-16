import { randomUUID } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { resolveFastModePreferenceFile } from "./resolve-fast-mode-preference-file.service.ts";

export function saveFastModePreference(enabled: boolean): void {
  const file = resolveFastModePreferenceFile();
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(temporary, `${JSON.stringify({ enabled })}\n`, { mode: 0o600 });
  renameSync(temporary, file);
}
