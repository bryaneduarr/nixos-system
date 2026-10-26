import { readFile, writeFile } from "node:fs/promises";
import type { EditResult } from "../../../../types/tools/edit/edit-result.interface.ts";
import type { ReplaceChange } from "../../../../types/tools/edit/replace-change.interface.ts";
import { addDiff } from "../../diff/add-diff.service.ts";
import { emptyDiff } from "../../diff/empty-diff.service.ts";
import { formatDiffStats } from "../../diff/format-diff-stats.service.ts";
import { replacementDiff } from "../../diff/replacement-diff.service.ts";
import { findWhitespaceMismatchLines } from "./find-whitespace-mismatch-lines.service.ts";

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function notFoundSummary(path: string, content: string, oldText: string): string {
  const candidateLines = findWhitespaceMismatchLines(content, oldText);
  const lineLabel = candidateLines.length === 1 ? "line" : "lines";
  const hint =
    candidateLines.length > 0
      ? `\n\nIgnoring whitespace, the first oldText line matches ${lineLabel} ${candidateLines.join(", ")}. Read them and copy their exact indentation.`
      : "";
  return `Replace failed: oldText not found in ${path}.${hint}\n\noldText:\n${oldText}`;
}

export async function replaceFile(change: ReplaceChange, target: string): Promise<EditResult> {
  if (change.edits.length === 0) {
    return { summary: "Replace failed: no edits provided.", changed: false };
  }

  let content: string;
  try {
    content = await readFile(target, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { summary: `Replace failed: ${message}`, changed: false };
  }

  let nextContent = content;
  let stats = emptyDiff();
  for (const edit of change.edits) {
    const occurrences = countOccurrences(nextContent, edit.oldText);
    if (occurrences === 0) {
      return { summary: notFoundSummary(change.path, nextContent, edit.oldText), changed: false };
    }
    if (occurrences > 1 && !change.replaceAll) {
      return {
        summary: `Replace failed: oldText appears ${occurrences} times in ${change.path}. Provide more context or set replaceAll=true.`,
        changed: false,
      };
    }
    // A replacer function keeps dollar replacement patterns in newText literal.
    const replaced = change.replaceAll
      ? nextContent.split(edit.oldText).join(edit.newText)
      : nextContent.replace(edit.oldText, () => edit.newText);
    if (replaced === nextContent) {
      return {
        summary: `Replace failed: replacement produced no change in ${change.path}.`,
        changed: false,
      };
    }
    nextContent = replaced;
    stats = addDiff(stats, replacementDiff(edit.oldText, edit.newText));
  }

  await writeFile(target, nextContent, "utf8");
  return {
    summary: `Modified:\n${change.path}\n\n${formatDiffStats(stats)}`,
    changed: true,
  };
}
