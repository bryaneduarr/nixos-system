import { basename } from "node:path";
import { rgbColor, truncateToWidth } from "@earendil-works/pi-tui";
import {
  DRAFT_STATUS_RGB,
  MENU_CHROME_LINES,
  MENU_FOOTER,
  MENU_HEIGHT_RATIO,
  MENU_LINES_PER_ROW,
} from "../../../../constants/sessions/menu/menu.constant.ts";
import { USAGE_STATE_MEASURED } from "../../../../constants/sessions/registry/usage-state.constant.ts";
import { THEME_ACCENT, THEME_MUTED } from "../../../../constants/split-view/theme-color.constant.ts";
import type { SessionMenuView } from "../../../../types/sessions/menu/session/session-menu-view.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { terminalLabel } from "./terminal-label.service.ts";

export function renderSessionMenu(view: SessionMenuView): string[] {
  const selected = view.rows.findIndex((row) => isHighlighted(view, row));
  const lines = [view.theme.bold(view.theme.fg(THEME_ACCENT, "Pi sessions")), ...view.filterLines, ""];
  const count = Math.max(
    1,
    Math.floor((view.terminalRows * MENU_HEIGHT_RATIO - MENU_CHROME_LINES) / MENU_LINES_PER_ROW),
  );
  const start = Math.max(0, selected - Math.floor(count / 2));
  lines.push(...renderRows(view, view.rows.slice(start, start + count)));
  if (view.rows.length === 0) lines.push("No matching live Pi sessions");
  if (view.refreshError.state === "present") lines.push("", terminalLabel(view.refreshError.value));
  lines.push("", MENU_FOOTER);
  return frameLines(view, lines);
}

function renderRows(view: SessionMenuView, rows: readonly LiveSession[]): string[] {
  const lines: string[] = [];
  let cwd = "";
  for (const row of rows) {
    if (row.cwd !== cwd) {
      cwd = row.cwd;
      lines.push(view.theme.fg(THEME_MUTED, terminalLabel(basename(cwd) || cwd)));
    }
    const prefix = isHighlighted(view, row) ? "> " : "  ";
    const status =
      row.status === "draft" ? view.theme.style("draft", { fg: rgbColor(...DRAFT_STATUS_RGB) }) : row.status;
    const context = row.context.usageState === USAGE_STATE_MEASURED ? `${row.context.percent.toFixed(0)}%` : "unknown";
    const currentMarker = row.pid === view.pid ? " *" : "";
    lines.push(
      `${prefix}${terminalLabel(row.name)}${currentMarker}  ${status}  ${terminalLabel(row.branch)}  ${context}`,
    );
  }
  return lines;
}

function isHighlighted(view: SessionMenuView, row: LiveSession): boolean {
  return view.selection.state === "present" && view.selection.value === row.identity;
}

function frameLines(view: SessionMenuView, lines: readonly string[]): string[] {
  const innerWidth = Math.max(1, view.width - 4);
  const borderWidth = Math.max(0, view.width - 2);
  const border = (text: string): string => view.theme.fg("borderMuted", text);
  const body = lines.map((line) => `${border("│")} ${truncateToWidth(line, innerWidth, "", true)} ${border("│")}`);
  return [border(`╭${"─".repeat(borderWidth)}╮`), ...body, border(`╰${"─".repeat(borderWidth)}╯`)].map((line) =>
    truncateToWidth(line, view.width),
  );
}
