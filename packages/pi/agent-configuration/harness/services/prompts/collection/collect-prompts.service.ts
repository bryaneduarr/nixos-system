import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { DRAFT_PROMPT_LABEL } from "../../../constants/prompts/prompt-item.constant.ts";
import { NEWLINE_CHARACTER } from "../../../constants/prompts/text.constant.ts";
import type { PromptItem } from "../../../types/prompts/collection/prompt-item.interface.ts";
import { isUserEntry } from "./is-user-entry.service.ts";

function userPromptText(entry: SessionEntry): string {
  if (entry.type !== "message" || entry.message.role !== "user") return "";
  const content = entry.message.content;
  return typeof content === "string"
    ? content
    : content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join(NEWLINE_CHARACTER);
}

export function collectPrompts(branch: readonly SessionEntry[], draft: string): PromptItem[] {
  const userEntries = branch.filter(isUserEntry);
  const sentPrompts = userEntries
    .map((entry, index) => ({ text: userPromptText(entry), turnsFromLatest: userEntries.length - 1 - index }))
    .filter((prompt) => prompt.text !== "")
    .reverse()
    .map(
      (prompt, index): PromptItem => ({
        text: prompt.text,
        label: `${index + 1}.`,
        turn: { kind: "turn", turnsFromLatest: prompt.turnsFromLatest },
      }),
    );
  const draftPrompts: PromptItem[] =
    draft.length > 0 ? [{ text: draft, label: DRAFT_PROMPT_LABEL, turn: { kind: "draft" } }] : [];
  return [...draftPrompts, ...sentPrompts];
}
