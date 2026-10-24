import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/done-detail-label.constant.ts";
import { SEARCH_SECTION_TITLES } from "../../../constants/tool-rendering/search-section-title.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";
import { runDetail } from "./run-detail.service.ts";

function isSearchMetadataLine(line: string): boolean {
  const isEmpty = line === "";
  const isSearchHeader = line.startsWith("search ");
  const isSectionTitle = SEARCH_SECTION_TITLES.has(line);
  const isAdditionalNote = line.startsWith("Additional ");
  const isFullOutputNote = line.startsWith("Full output:");
  const isBracketedNote = line.startsWith("[") && line.endsWith("]");
  return isEmpty || isSearchHeader || isSectionTitle || isAdditionalNote || isFullOutputNote || isBracketedNote;
}

function countSearchEntries(text: string): number {
  return text
    .split(/\r?\n/)
    .map((raw) => raw.trim())
    .filter((line) => !isSearchMetadataLine(line)).length;
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
  if (text.startsWith("Moved:")) {
    const movedPath = text.split(/\r?\n/)[1];
    return movedPath === undefined ? "Moved" : movedPath.trim();
  }
  return DONE_DETAIL_LABEL;
}

export function successDetail(tool: HarnessTool, text: string): string[] {
  switch (tool) {
    case "search": {
      const header = /^search ".*" \(([^)]+)\)/.exec(firstLine(text));
      if (/No (?:matches|files|structural)/.test(text)) return ["0 matches"];
      const count = countSearchEntries(text);
      const headerKind = header === null ? undefined : header[1];
      const kind = headerKind !== undefined && !headerKind.includes("fallback") ? ` (${headerKind})` : "";
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
