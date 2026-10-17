import { randomUUID } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODEL_STATE_FILE_MODE, MODEL_STATE_FILE_NAME } from "../../constants/model-selection/state-file.constant.ts";
import type { ModelSelection } from "../../types/model-selection/model-selection.interface.ts";
import { resolveModelStateDirectory } from "./resolve-model-state-directory.service.ts";

function savedModelFileRecord(selection: ModelSelection) {
  const identity = { provider: selection.provider, id: selection.id };
  return selection.thinking.state === "chosen" ? { ...identity, thinkingLevel: selection.thinking.level } : identity;
}

export function saveModel(selection: ModelSelection): void {
  const stateDirectory = resolveModelStateDirectory();
  const stateFile = join(stateDirectory, MODEL_STATE_FILE_NAME);
  mkdirSync(stateDirectory, { recursive: true });
  const temporary = `${stateFile}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(savedModelFileRecord(selection))}\n`, { mode: MODEL_STATE_FILE_MODE });
  renameSync(temporary, stateFile);
}
