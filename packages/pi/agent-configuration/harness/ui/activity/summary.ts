import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../constants/activity/activity-entry.constant.ts";
import { SPINNER_FRAMES } from "../../constants/activity/spinner.constant.ts";
import { toolLabel } from "../../services/tool-rendering/presentation/tool-label.service.ts";
import { toolTarget } from "../../services/tool-rendering/presentation/tool-target.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import { isHarnessTool } from "../../services/tools/is-harness-tool.service.ts";
import type { ActivitySummaryData } from "../../types/activity/activity-summary.interface.ts";
import { formatElapsed } from "./elapsed.ts";
import { actionsForMessage, activitySummaryState } from "./summary-state.ts";
import { isActivityVisible, toggleActivityVisibility } from "./visibility.ts";

function thinkingTitles(messageNumber: number): string[] {
  const entries = activityStore.all();
  const start = entries.findIndex(
    (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === messageNumber,
  );
  if (start < 0) return [];
  const next = entries.findIndex((entry, index) => index > start && entry.toolName === MESSAGE_ACTIVITY_NAME);
  const titles = entries
    .slice(start + 1, next < 0 ? undefined : next)
    .filter((entry) => entry.toolName === THINKING_ACTIVITY_NAME)
    .flatMap((entry) =>
      entry.text.split("\n").flatMap((line) => {
        const title = line.trim().match(/^(?:\*\*(.+?)\*\*|#{1,6}\s+(.+))$/);
        const titleText = title?.[1] ?? title?.[2];
        return titleText === undefined ? [] : [oneLine(titleText)];
      }),
    );
  return titles.filter((title, index) => titles.indexOf(title) === index);
}

class ActivitySummaryComponent implements Component {
  constructor(
    private readonly data: ActivitySummaryData,
    private readonly theme: Theme,
  ) {}

  render(width: number): string[] {
    const { working, frame, completions } = activitySummaryState();
    const expanded = isActivityVisible();
    const actions = actionsForMessage(this.data.messageNumber);
    const count = actions.length;
    const startedAt = activityStore
      .all()
      .find(
        (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === this.data.messageNumber,
      )?.startedAt;
    const duration =
      startedAt === undefined
        ? ""
        : formatElapsed((completions.get(this.data.messageNumber) ?? Date.now()) - startedAt);
    const leading = `Alt+V ${expanded ? "hide" : "show"}`;
    const countLabel = `${count} ${count === 1 ? "action" : "actions"}`;
    const details = "Alt+I details";
    const trailing = `${countLabel}${duration ? ` | ${duration}` : ""} | ${details}`;
    const entries = activityStore.all();
    const start = entries.findIndex(
      (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === this.data.messageNumber,
    );
    const next = entries.findIndex((entry, index) => index > start && entry.toolName === MESSAGE_ACTIVITY_NAME);
    const current = entries.slice(start + 1, next < 0 ? undefined : next);
    const lastTool = current.filter((entry) => isHarnessTool(entry.toolName)).at(-1);
    const toolTitle =
      lastTool && isHarnessTool(lastTool.toolName)
        ? `${toolLabel(lastTool.toolName)} ${toolTarget(lastTool.toolName, lastTool.args)}`
        : "";
    const latest =
      thinkingTitles(this.data.messageNumber).at(-1) ||
      oneLine(current.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME).at(-1)?.text ?? "") ||
      toolTitle;
    const runningTools = current.filter((entry) => isHarnessTool(entry.toolName) && entry.status === "running");
    const mark =
      working && (runningTools.length === 0 || !expanded)
        ? SPINNER_FRAMES[frame % SPINNER_FRAMES.length]
        : working
          ? "·"
          : "done";
    const activity = `${mark} ${latest || (working ? "Working" : "Completed")}`;
    const singleLineTitleWidth = width - visibleWidth(`- ${leading} |  | ${trailing} `) - 1;
    const twoLines = singleLineTitleWidth < visibleWidth(activity);
    const titleWidth = Math.max(0, twoLines ? width - visibleWidth(`┌ ${leading} | `) - 1 : singleLineTitleWidth);
    const title =
      titleWidth > 0
        ? ` | ${this.theme.fg(working ? "accent" : "muted", truncateToWidth(activity, titleWidth, "...", true))}`
        : "";
    const header = this.divider(
      `${this.theme.fg("muted", leading)}${title}${twoLines ? "" : this.theme.fg("muted", ` | ${trailing}`)}`,
      width,
      twoLines ? "┌ " : "- ",
    );
    const footer: string[] = [];
    if (twoLines) {
      const parts = [countLabel, ...(duration ? [duration] : []), details];
      const available = Math.max(1, width - 3);
      let footerLine = "";
      for (const part of parts) {
        const candidate = footerLine ? `${footerLine} | ${part}` : part;
        if (footerLine && visibleWidth(candidate) > available) {
          footer.push(footerLine);
          footerLine = part;
        } else {
          footerLine = candidate;
        }
      }
      footer.push(footerLine);
      for (const [index, part] of footer.entries()) {
        footer[index] = this.divider(this.theme.fg("muted", part), width, index === footer.length - 1 ? "└ " : "│ ");
      }
    }
    if (!expanded) return [header, ...footer];
    const updates = current.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME && entry.text.trim());
    const lines = updates.flatMap((entry) =>
      entry.text
        .trim()
        .split("\n")
        .map((line) => this.theme.fg("muted", truncateToWidth(`  ${oneLine(line)}`, width, "...", true))),
    );
    for (const tool of working ? runningTools : []) {
      const target = isHarnessTool(tool.toolName) ? toolTarget(tool.toolName, tool.args) : "";
      lines.push(
        this.theme.fg(
          "accent",
          truncateToWidth(
            `  ${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${toolLabel(tool.toolName)}${target ? ` · ${target}` : ""}`,
            width,
            "...",
            true,
          ),
        ),
      );
    }
    return [header, ...footer, ...lines];
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    if (event.type !== "click" || event.button !== "left" || event.y !== 0) {
      return undefined;
    }
    toggleActivityVisibility();
    return { handled: true, render: true };
  }

  invalidate(): void {
    // Rendering reads the current branch's activity store.
  }

  private divider(label: string, width: number, prefix = "- "): string {
    if (width < 4) {
      return truncateToWidth("-", Math.max(1, width), "", true);
    }
    const suffix = " ";
    const labelWidth = Math.max(1, width - visibleWidth(prefix) - 1);
    const clippedLabel = truncateToWidth(label, labelWidth, "", true);
    const remaining = Math.max(0, width - visibleWidth(prefix) - visibleWidth(clippedLabel) - visibleWidth(suffix));
    return `${this.theme.fg("muted", prefix)}${clippedLabel}${this.theme.fg("muted", `${suffix}${"-".repeat(remaining)}`)}`;
  }
}

export function renderActivitySummary(data: ActivitySummaryData, theme: Theme): Component {
  return new ActivitySummaryComponent(data, theme);
}
