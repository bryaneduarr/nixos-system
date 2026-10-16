import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorNavigationOptions } from "../../../types/inspector/navigation/inspector-navigation-options.interface.ts";
import type { RowSelection } from "../../../types/inspector/navigation/row-selection.interface.ts";
import { activityStore } from "../../activity/store/shared-activity-store.service.ts";
import { buildInspectorRows } from "./build-inspector-rows.service.ts";
import { rowKey } from "./row-key.service.ts";

export function createInspectorNavigation(options: InspectorNavigationOptions): InspectorNavigation {
  const navigation: InspectorNavigation = {
    selection: { kind: "none" },
    focus: "list",
    detailScroll: 0,
    artifact: { kind: "tool-result" },
    page: "tools",
    expandedTasks: new Set<string>(),
    subagentSelection: { kind: "none" },
    subagentScroll: 0,
    detailViewportHeight: 0,
    listScroll: 0,
    buildRows: () => buildInspectorRows(navigation.page, navigation.expandedTasks),
    subagentEntries: () => activityStore.all().filter((entry) => entry.toolName === TASK_TOOL_NAME),
    selectedIndex: (rows) => {
      const index = rows.findIndex((row) => isRowSelected(row, navigation.selection));
      return index >= 0 ? index : 0;
    },
    currentRow: () => {
      const rows = navigation.buildRows();
      const row = rows[navigation.selectedIndex(rows)];
      return row ? { found: true, row } : { found: false };
    },
    syncSelection: (rows) => {
      const lastRow = rows[rows.length - 1];
      if (rows.length === 0) {
        navigation.selection = { kind: "none" };
      } else if (!rows.some((row) => isRowSelected(row, navigation.selection)) && lastRow) {
        navigation.selection = { kind: "row", id: rowKey(lastRow) };
      }
    },
    adjustSubagentCollapse: (direction) => adjustSubagentCollapse(navigation, options, direction),
    select: (id) => {
      if (navigation.selection.kind === "row" && navigation.selection.id === id) return;
      navigation.selection = { kind: "row", id };
      navigation.detailScroll = 0;
      navigation.artifact = { kind: "tool-result" };
      options.changed();
    },
    step: (delta) => {
      if (navigation.page === "subagents") {
        stepSubagents(navigation, options, delta);
        return;
      }
      if (navigation.focus === "list") {
        const rows = navigation.buildRows();
        const next = Math.max(0, Math.min(rows.length - 1, navigation.selectedIndex(rows) + delta));
        const row = rows[next];
        if (row) navigation.select(rowKey(row));
        return;
      }
      const viewport = navigation.detailViewportHeight || options.bodyHeight();
      const maxScroll = Math.max(0, options.detailLength() - viewport);
      navigation.detailScroll = Math.max(0, Math.min(maxScroll, navigation.detailScroll + delta));
      options.changed();
    },
    jump: (where) => jump(navigation, options, where),
  };
  return navigation;
}

function isRowSelected(row: InspectorRow, selection: RowSelection): boolean {
  return selection.kind === "row" && rowKey(row) === selection.id;
}

function adjustSubagentCollapse(
  navigation: InspectorNavigation,
  options: InspectorNavigationOptions,
  direction: "left" | "right",
): boolean {
  const lookup = navigation.currentRow();
  if (!lookup.found) return false;
  const entry = lookup.row.entry;
  if (entry.toolName !== TASK_TOOL_NAME || entry.sub.length === 0) return false;

  if (direction === "left") {
    navigation.expandedTasks.delete(entry.id);
    navigation.selection = { kind: "row", id: entry.id };
    navigation.detailScroll = 0;
  } else {
    navigation.expandedTasks.add(entry.id);
    const last = entry.sub.at(-1);
    navigation.selection = { kind: "row", id: last ? rowKey({ level: "sub", entry, sub: last }) : entry.id };
    navigation.detailScroll = Number.MAX_SAFE_INTEGER;
  }
  options.changed();
  return true;
}

function stepSubagents(navigation: InspectorNavigation, options: InspectorNavigationOptions, delta: number): void {
  const rows = navigation.subagentEntries();
  if (rows.length === 0) return;
  const selectedId = navigation.subagentSelection.kind === "selected" ? navigation.subagentSelection.id : undefined;
  const current = Math.max(
    0,
    rows.findIndex((row) => row.id === selectedId),
  );
  const next = Math.max(0, Math.min(rows.length - 1, current + delta));
  const nextRow = rows[next];
  if (nextRow) navigation.subagentSelection = { kind: "selected", id: nextRow.id };
  const height = Math.max(1, options.bodyHeight() - 2);
  navigation.subagentScroll = Math.max(0, Math.min(Math.max(0, rows.length - height), Math.max(0, next - height + 1)));
  options.changed();
}

function jump(navigation: InspectorNavigation, options: InspectorNavigationOptions, where: "start" | "end"): void {
  if (navigation.page === "subagents") {
    const rows = navigation.subagentEntries();
    const row = where === "start" ? rows[0] : rows[rows.length - 1];
    if (row) {
      navigation.subagentSelection = { kind: "selected", id: row.id };
      const height = Math.max(1, options.bodyHeight() - 1);
      navigation.subagentScroll = where === "start" ? 0 : Math.max(0, rows.length - height);
      options.changed();
    }
    return;
  }
  if (navigation.focus === "list") {
    const rows = navigation.buildRows();
    const row = where === "start" ? rows[0] : rows[rows.length - 1];
    if (row) navigation.select(rowKey(row));
    return;
  }
  const viewport = navigation.detailViewportHeight || options.bodyHeight();
  navigation.detailScroll = where === "start" ? 0 : Math.max(0, options.detailLength() - viewport);
  options.changed();
}
