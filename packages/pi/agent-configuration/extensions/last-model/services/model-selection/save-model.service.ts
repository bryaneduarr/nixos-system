import { randomUUID } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import {
  MODEL_STATE_DIRECTORY,
  MODEL_STATE_FILE,
  MODEL_STATE_FILE_MODE,
} from "../../constants/model-selection/state-file.constant.ts";
import type { ModelSelection } from "../../types/model-selection/model-selection.interface.ts";

function savedModelFileRecord(selection: ModelSelection) {
  const identity = { provider: selection.provider, id: selection.id };
  return selection.thinking.state === "chosen" ? { ...identity, thinkingLevel: selection.thinking.level } : identity;
}

export function saveModel(selection: ModelSelection): void {
  mkdirSync(MODEL_STATE_DIRECTORY, { recursive: true });
  const temporary = `${MODEL_STATE_FILE}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(savedModelFileRecord(selection))}\n`, { mode: MODEL_STATE_FILE_MODE });
  renameSync(temporary, MODEL_STATE_FILE);
}
