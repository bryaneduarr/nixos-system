import {
  THINKING_TOOL_NAME,
  UPDATE_TOOL_NAME,
  USER_MESSAGE_TOOL_NAME,
} from "../../constants/inspector/pseudo-tool.constant.ts";
import { activityStore } from "../../services/activity/store/shared-activity-store.service.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";
import type { DetailArtifact } from "../../types/inspector/detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorFocus, InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";
import type { SubagentSelection } from "../../types/inspector/subagents/subagent-selection.interface.ts";

export function rowKey(row: InspectorRow): string {
  return row.level === "sub" ? `${row.entry.id}::${row.sub.id}` : row.entry.id;
}

export class InspectorNavigation {
  selectedId?: string;
  focus: InspectorFocus = "list";
  detailScroll = 0;
  artifact: DetailArtifact = { kind: "tool-result" };
  page: InspectorPage = "tools";
  readonly expandedTasks = new Set<string>();
  subagentSelection: SubagentSelection = { kind: "none" };
  subagentScroll = 0;
  detailViewportHeight = 0;
  listScroll = 0;

  constructor(
    private readonly bodyHeight: () => number,
    private readonly detailLength: () => number,
    private readonly changed: () => void,
  ) {}

  buildRows(): InspectorRow[] {
    const rows: InspectorRow[] = [];
    for (const entry of activityStore.all()) {
      if (this.page === "messages") {
        if (entry.toolName !== USER_MESSAGE_TOOL_NAME) continue;
      } else if (
        entry.toolName === USER_MESSAGE_TOOL_NAME ||
        entry.toolName === THINKING_TOOL_NAME ||
        entry.toolName === UPDATE_TOOL_NAME
      ) {
        continue;
      }
      rows.push({ level: "entry", entry });
      if (!this.expandedTasks.has(entry.id)) continue;
      for (const sub of entry.sub) rows.push({ level: "sub", entry, sub });
    }
    return rows;
  }

  subagentEntries(): ToolActivity[] {
    return activityStore.all().filter((entry) => entry.toolName === "task");
  }

  selectedIndex(rows: InspectorRow[]): number {
    const index = rows.findIndex((row) => rowKey(row) === this.selectedId);
    return index >= 0 ? index : 0;
  }

  currentRow(rows: InspectorRow[] = this.buildRows()): InspectorRow | undefined {
    return rows[this.selectedIndex(rows)];
  }

  syncSelection(rows: InspectorRow[]): void {
    if (rows.length === 0) {
      this.selectedId = undefined;
    } else if (!this.selectedId || !rows.some((row) => rowKey(row) === this.selectedId)) {
      this.selectedId = rowKey(rows[rows.length - 1]);
    }
  }

  adjustSubagentCollapse(direction: "left" | "right"): boolean {
    const entry = this.currentRow()?.entry;
    if (!entry || entry.toolName !== "task" || entry.sub.length === 0) return false;
    if (direction === "left") {
      this.expandedTasks.delete(entry.id);
      this.selectedId = entry.id;
      this.detailScroll = 0;
    } else {
      this.expandedTasks.add(entry.id);
      const last = entry.sub[entry.sub.length - 1];
      this.selectedId = last ? `${entry.id}::${last.id}` : entry.id;
      this.detailScroll = Number.MAX_SAFE_INTEGER;
    }
    this.changed();
    return true;
  }

  stepSubagents(delta: number): void {
    const rows = this.subagentEntries();
    if (rows.length === 0) return;
    const current = Math.max(
      0,
      rows.findIndex((row) => this.subagentSelection.kind === "selected" && row.id === this.subagentSelection.id),
    );
    const next = Math.max(0, Math.min(rows.length - 1, current + delta));
    const nextRow = rows[next];
    if (nextRow) this.subagentSelection = { kind: "selected", id: nextRow.id };
    const height = Math.max(1, this.bodyHeight() - 2);
    this.subagentScroll = Math.max(0, Math.min(Math.max(0, rows.length - height), Math.max(0, next - height + 1)));
    this.changed();
  }

  select(id: string): void {
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.detailScroll = 0;
    this.artifact = { kind: "tool-result" };
    this.changed();
  }

  step(delta: number): void {
    if (this.page === "subagents") {
      this.stepSubagents(delta);
      return;
    }
    if (this.focus === "list") {
      const rows = this.buildRows();
      const next = Math.max(0, Math.min(rows.length - 1, this.selectedIndex(rows) + delta));
      const row = rows[next];
      if (row) this.select(rowKey(row));
      return;
    }
    const viewport = this.detailViewportHeight || this.bodyHeight();
    const maxScroll = Math.max(0, this.detailLength() - viewport);
    this.detailScroll = Math.max(0, Math.min(maxScroll, this.detailScroll + delta));
    this.changed();
  }

  jump(where: "start" | "end"): void {
    if (this.page === "subagents") {
      const rows = this.subagentEntries();
      const row = where === "start" ? rows[0] : rows[rows.length - 1];
      if (row) {
        this.subagentSelection = { kind: "selected", id: row.id };
        const height = Math.max(1, this.bodyHeight() - 1);
        this.subagentScroll = where === "start" ? 0 : Math.max(0, rows.length - height);
        this.changed();
      }
      return;
    }
    if (this.focus === "list") {
      const rows = this.buildRows();
      const row = where === "start" ? rows[0] : rows[rows.length - 1];
      if (row) this.select(rowKey(row));
      return;
    }
    const viewport = this.detailViewportHeight || this.bodyHeight();
    this.detailScroll = where === "start" ? 0 : Math.max(0, this.detailLength() - viewport);
    this.changed();
  }
}
