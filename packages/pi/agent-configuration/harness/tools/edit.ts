import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { addDiff, countLines, emptyDiff, formatDiffStats, replacementDiff } from "./diff.ts";
import { stripAtPrefix } from "./format.ts";
import { withPathLock } from "./locks.ts";

export type EditOperation = "replace" | "create" | "delete" | "move";

export interface TextEdit {
  oldText: string;
  newText: string;
}

export interface EditOptions {
  cwd: string;
  op: EditOperation;
  path: string;
  oldText?: string;
  newText?: string;
  edits?: TextEdit[];
  content?: string;
  overwrite?: boolean;
  replaceAll?: boolean;
  from?: string;
  to?: string;
}

export interface EditResult {
  summary: string;
  changed: boolean;
}

function resolvePath(cwd: string, value: string): string {
  const raw = stripAtPrefix(value);
  return isAbsolute(raw) ? raw : resolve(cwd, raw);
}

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

export async function editFile(options: EditOptions): Promise<EditResult> {
  const { cwd, op } = options;
  const target = resolvePath(cwd, options.path);

  return withPathLock(target, async () => {
    if (op === "create") {
      const content = options.content ?? "";
      let exists = true;
      try {
        await readFile(target, "utf8");
      } catch {
        exists = false;
      }
      if (exists && !options.overwrite) {
        return {
          summary: `Create failed: ${options.path} already exists (set overwrite=true to replace).`,
          changed: false,
        };
      }
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content, "utf8");
      return {
        summary: `Created:\n${options.path}\n\n${formatDiffStats({
          added: countLines(content),
          removed: 0,
        })}`,
        changed: true,
      };
    }

    if (op === "delete") {
      let content = "";
      try {
        content = await readFile(target, "utf8");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { summary: `Delete failed: ${message}`, changed: false };
      }
      await unlink(target);
      return {
        summary: `Deleted:\n${options.path}\n\n${formatDiffStats({
          added: 0,
          removed: countLines(content),
        })}`,
        changed: true,
      };
    }

    if (op === "move") {
      if (!options.to) {
        return { summary: "Move failed: 'to' is required.", changed: false };
      }
      const destination = resolvePath(cwd, options.to);
      if (destination === target) {
        return { summary: "Move failed: source and destination are identical.", changed: false };
      }
      let destinationExists = true;
      try {
        await readFile(destination, "utf8");
      } catch {
        destinationExists = false;
      }
      if (destinationExists && !options.overwrite) {
        return {
          summary: `Move failed: ${options.to} already exists (set overwrite=true to replace).`,
          changed: false,
        };
      }
      try {
        await mkdir(dirname(destination), { recursive: true });
        await rename(target, destination);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { summary: `Move failed: ${message}`, changed: false };
      }
      return {
        summary: `Moved:\n${options.path} -> ${options.to}`,
        changed: true,
      };
    }

    const edits: TextEdit[] =
      options.edits && options.edits.length > 0
        ? options.edits
        : options.oldText !== undefined
          ? [{ oldText: options.oldText, newText: options.newText ?? "" }]
          : [];

    if (edits.length === 0) {
      return { summary: "Replace failed: no edits provided.", changed: false };
    }

    let content: string;
    try {
      content = await readFile(target, "utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { summary: `Replace failed: ${message}`, changed: false };
    }

    let next = content;
    let stats = emptyDiff();
    for (const edit of edits) {
      const occurrences = countOccurrences(next, edit.oldText);
      if (occurrences === 0) {
        return {
          summary: `Replace failed: oldText not found in ${options.path}.\n\noldText:\n${edit.oldText}`,
          changed: false,
        };
      }
      if (occurrences > 1 && !options.replaceAll) {
        return {
          summary: `Replace failed: oldText appears ${occurrences} times in ${options.path}. Provide more context or set replaceAll=true.`,
          changed: false,
        };
      }
      const replaced = options.replaceAll
        ? next.split(edit.oldText).join(edit.newText)
        : next.replace(edit.oldText, edit.newText);
      if (replaced === next) {
        return {
          summary: `Replace failed: replacement produced no change in ${options.path}.`,
          changed: false,
        };
      }
      next = replaced;
      stats = addDiff(stats, replacementDiff(edit.oldText, edit.newText));
    }

    await writeFile(target, next, "utf8");
    return {
      summary: `Modified:\n${options.path}\n\n${formatDiffStats(stats)}`,
      changed: true,
    };
  });
}
