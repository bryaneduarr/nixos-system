import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import type { PromptItem } from "../../../types/prompts/prompt-item.interface.ts";

function userPromptTexts(entry: SessionEntry): string[] {
  if (entry.type !== "message" || entry.message.role !== "user") return [];
  const content = entry.message.content;
  const text =
    typeof content === "string"
      ? content
      : content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("\n");
  return text ? [text] : [];
}

export function collectPrompts(branch: readonly SessionEntry[], draft: string): PromptItem[] {
  const sentPrompts = branch
    .flatMap(userPromptTexts)
    .reverse()
    .map((text, index) => ({ text, label: `${index + 1}.` }));
  const draftPrompts = draft.length > 0 ? [{ text: draft, label: "Draft" }] : [];
  return [...draftPrompts, ...sentPrompts];
}
