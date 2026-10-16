import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/done-detail-label.constant.ts";
import { SEARCH_SECTION_TITLES } from "../../../constants/tool-rendering/search-section-title.constant.ts";
import type { HarnessTool } from "../../../types/tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";
import { runDetail } from "./run-detail.service.ts";

function countSearchEntries(text: string): number {
  let count = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (
      !line ||
      line.startsWith("search ") ||
      SEARCH_SECTION_TITLES.has(line) ||
      line.startsWith("Additional ") ||
      line.startsWith("Full output:") ||
      (line.startsWith("[") && line.endsWith("]"))
    )
      continue;
    count += 1;
  }
  return count;
}

function readDetail(text: string): string {
  const head = firstLine(text);
  const structure = /\((\d+) lines, \d+ bytes\).*structure only/.exec(head);
  if (structure) return `${structure[1]} lines (structure)`;
  const range = /\(lines (\d+)-(\d+) of (\d+)\)/.exec(head);
  if (range) return `lines ${range[1]}-${range[2]} of ${range[3]}`;
  const total = /\((\d+) lines\)/.exec(head);
  if (total) return `${total[1]} lines`;
  return DONE_DETAIL_LABEL;
}

function editDetail(text: string): string {
  const diff = /\+(\d+) -(\d+)/.exec(text);
  if (diff) return `+${diff[1]} -${diff[2]}`;
  if (text.startsWith("Moved:")) return text.split(/\r?\n/)[1]?.trim() ?? "Moved";
  return DONE_DETAIL_LABEL;
}

export function successDetail(tool: HarnessTool, text: string): string[] {
  switch (tool) {
    case "search": {
      const header = /^search ".*" \(([^)]+)\)/.exec(firstLine(text));
      if (/No (?:matches|files|structural)/.test(text)) return ["0 matches"];
      const count = countSearchEntries(text);
      const kind = header?.[1] && !header[1].includes("fallback") ? ` (${header[1]})` : "";
      return [`${count} match${count === 1 ? "" : "es"}${kind}`];
    }
    case "read":
      return [readDetail(text)];
    case "edit":
      return [editDetail(text)];
    case "run":
      return [runDetail(text)];
    default:
      return [DONE_DETAIL_LABEL];
  }
}
