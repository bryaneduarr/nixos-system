import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { NEWLINE_CHARACTER } from "../../../constants/prompts/text.constant.ts";
import type { PromptItem } from "../../../types/prompts/collection/prompt-item.interface.ts";
import { isUserEntry } from "./is-user-entry.service.ts";

function agentOutputText(entry: SessionEntry): string {
  if (entry.type !== "message" || entry.message.role !== "assistant") return "";
  return entry.message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join(NEWLINE_CHARACTER);
}

export function collectAgentOutputs(branch: readonly SessionEntry[]): PromptItem[] {
  const turnCount = branch.filter(isUserEntry).length;
  let turnsStarted = 0;
  const outputs = branch.flatMap((entry) => {
    if (isUserEntry(entry)) turnsStarted++;
    const text = agentOutputText(entry);
    if (!text.trim()) return [];
    const turnsFromLatest = Math.max(0, turnCount - Math.max(1, turnsStarted));
    return [{ text, turnsFromLatest }];
  });
  return outputs.reverse().map(
    (output, index): PromptItem => ({
      text: output.text,
      label: `${index + 1}.`,
      turn: { kind: "turn", turnsFromLatest: output.turnsFromLatest },
    }),
  );
}
