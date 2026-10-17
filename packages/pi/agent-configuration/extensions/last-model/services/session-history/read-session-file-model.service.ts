import { readFileSync } from "node:fs";
import { Value } from "typebox/value";
import { UNCHOSEN_THINKING } from "../../constants/model-selection/unchosen-thinking.constant.ts";
import {
  MESSAGE_ENTRY_TYPE,
  MODEL_CHANGE_ENTRY_TYPE,
  THINKING_LEVEL_CHANGE_ENTRY_TYPE,
} from "../../constants/session-history/session-entry-type.constant.ts";
import {
  ModelChangeEntrySchema,
  SessionEntryTypeSchema,
  ThinkingLevelChangeEntrySchema,
} from "../../schemas/session-history/session-entry.schema.ts";
import type { ModelSelectionLookup, ThinkingChoice } from "../../types/model-selection/model-selection.interface.ts";

const NOT_FOUND: ModelSelectionLookup = { found: false };

function hasEntryType(entry: unknown, type: string): boolean {
  return Value.Check(SessionEntryTypeSchema, entry) && entry.type === type;
}

function sessionModelFromEntry(entry: unknown): ModelSelectionLookup {
  if (!Value.Check(ModelChangeEntrySchema, entry)) return NOT_FOUND;
  return { found: true, selection: { provider: entry.provider, id: entry.modelId, thinking: UNCHOSEN_THINKING } };
}

function latestModelChange(entries: readonly unknown[]): ModelSelectionLookup {
  for (const entry of entries.toReversed()) {
    if (!hasEntryType(entry, MODEL_CHANGE_ENTRY_TYPE)) continue;
    const lookup = sessionModelFromEntry(entry);
    if (lookup.found) return lookup;
  }
  return NOT_FOUND;
}

function latestThinkingChoice(entries: readonly unknown[]): ThinkingChoice {
  for (const entry of entries.toReversed()) {
    if (!hasEntryType(entry, THINKING_LEVEL_CHANGE_ENTRY_TYPE)) continue;
    if (Value.Check(ThinkingLevelChangeEntrySchema, entry)) {
      return { state: "chosen", level: entry.thinkingLevel };
    }
  }
  return UNCHOSEN_THINKING;
}

function modelFromSessionEntries(entries: readonly unknown[]): ModelSelectionLookup {
  const modelChangeCount = entries.filter((entry) => hasEntryType(entry, MODEL_CHANGE_ENTRY_TYPE)).length;
  const hasMessage = entries.some((entry) => hasEntryType(entry, MESSAGE_ENTRY_TYPE));
  const model = latestModelChange(entries);
  const isUsableSession = hasMessage || modelChangeCount > 1;
  if (!model.found || !isUsableSession) return NOT_FOUND;
  return { found: true, selection: { ...model.selection, thinking: latestThinkingChoice(entries) } };
}

export function readSessionFileModel(path: string): ModelSelectionLookup {
  try {
    const entries = readFileSync(path, "utf8")
      .trimEnd()
      .split("\n")
      .map((line): unknown => JSON.parse(line));
    return modelFromSessionEntries(entries);
  } catch {
    return NOT_FOUND;
  }
}
