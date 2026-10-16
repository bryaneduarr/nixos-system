import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import type { EditParameters } from "../types/tools/edit/edit-parameters.interface.ts";
import type { EditRequest, EditRequestValidation, TextEdit } from "../types/tools/edit/edit-request.interface.ts";
import type { EditResult } from "../types/tools/edit/edit-result.interface.ts";
import { addDiff, countLines, emptyDiff, formatDiffStats, replacementDiff } from "./diff.ts";
import { stripAtPrefix } from "./format.ts";
import { withPathLock } from "./locks.ts";

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

function replaceEdits(params: EditParameters): readonly TextEdit[] {
  if (params.edits && params.edits.length > 0) return params.edits;
  if (params.oldText !== undefined) return [{ oldText: params.oldText, newText: params.newText ?? "" }];
  return [];
}

export function toEditRequest(cwd: string, params: EditParameters): EditRequestValidation {
  const path = params.path ?? params.from;
  if (!path) {
    return { valid: false, summary: "edit failed: 'path' is required." };
  }
  if (params.op === "replace") {
    return {
      valid: true,
      request: {
        cwd,
        change: { op: "replace", path, edits: replaceEdits(params), replaceAll: params.replaceAll ?? false },
      },
    };
  }
  if (params.op === "create") {
    return {
      valid: true,
      request: {
        cwd,
        change: { op: "create", path, content: params.content ?? "", overwrite: params.overwrite ?? false },
      },
    };
  }
  if (params.op === "delete") {
    return { valid: true, request: { cwd, change: { op: "delete", path } } };
  }
  if (!params.to) {
    return { valid: false, summary: "Move failed: 'to' is required." };
  }
  return {
    valid: true,
    request: { cwd, change: { op: "move", path, destination: params.to, overwrite: params.overwrite ?? false } },
  };
}

export async function editFile(request: EditRequest): Promise<EditResult> {
  const { cwd, change } = request;
  const target = resolvePath(cwd, change.path);

  return withPathLock(target, async () => {
    if (change.op === "create") {
      let exists = true;
      try {
        await readFile(target, "utf8");
      } catch {
        exists = false;
      }
      if (exists && !change.overwrite) {
        return {
          summary: `Create failed: ${change.path} already exists (set overwrite=true to replace).`,
          changed: false,
        };
      }
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, change.content, "utf8");
      return {
        summary: `Created:\n${change.path}\n\n${formatDiffStats({
          added: countLines(change.content),
          removed: 0,
        })}`,
        changed: true,
      };
    }

    if (change.op === "delete") {
      let content = "";
      try {
        content = await readFile(target, "utf8");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { summary: `Delete failed: ${message}`, changed: false };
      }
      await unlink(target);
      return {
        summary: `Deleted:\n${change.path}\n\n${formatDiffStats({
          added: 0,
          removed: countLines(content),
        })}`,
        changed: true,
      };
    }

    if (change.op === "move") {
      const destination = resolvePath(cwd, change.destination);
      if (destination === target) {
        return { summary: "Move failed: source and destination are identical.", changed: false };
      }
      let destinationExists = true;
      try {
        await readFile(destination, "utf8");
      } catch {
        destinationExists = false;
      }
      if (destinationExists && !change.overwrite) {
        return {
          summary: `Move failed: ${change.destination} already exists (set overwrite=true to replace).`,
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
        summary: `Moved:\n${change.path} -> ${change.destination}`,
        changed: true,
      };
    }

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

    let next = content;
    let stats = emptyDiff();
    for (const edit of change.edits) {
      const occurrences = countOccurrences(next, edit.oldText);
      if (occurrences === 0) {
        return {
          summary: `Replace failed: oldText not found in ${change.path}.\n\noldText:\n${edit.oldText}`,
          changed: false,
        };
      }
      if (occurrences > 1 && !change.replaceAll) {
        return {
          summary: `Replace failed: oldText appears ${occurrences} times in ${change.path}. Provide more context or set replaceAll=true.`,
          changed: false,
        };
      }
      const replaced = change.replaceAll
        ? next.split(edit.oldText).join(edit.newText)
        : next.replace(edit.oldText, edit.newText);
      if (replaced === next) {
        return {
          summary: `Replace failed: replacement produced no change in ${change.path}.`,
          changed: false,
        };
      }
      next = replaced;
      stats = addDiff(stats, replacementDiff(edit.oldText, edit.newText));
    }

    await writeFile(target, next, "utf8");
    return {
      summary: `Modified:\n${change.path}\n\n${formatDiffStats(stats)}`,
      changed: true,
    };
  });
}
