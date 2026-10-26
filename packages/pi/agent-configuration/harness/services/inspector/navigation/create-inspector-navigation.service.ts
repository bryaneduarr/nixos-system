import { DEFAULT_ARTIFACT } from "../../../constants/inspector/detail/default-artifact.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorNavigationOptions } from "../../../types/inspector/navigation/inspector-navigation-options.interface.ts";
import { clampDetailScroll } from "../layout/clamp-detail-scroll.service.ts";
import { adjustSubagentCollapse } from "./adjust-subagent-collapse.service.ts";
import { buildInspectorRows } from "./build-inspector-rows.service.ts";
import { findRowAt } from "./find-row-at.service.ts";
import { isRowSelected } from "./is-row-selected.service.ts";
import { jumpInspector } from "./jump-inspector.service.ts";
import { rowKey } from "./row-key.service.ts";
import { stepSubagents } from "./step-subagents.service.ts";

export function createInspectorNavigation(options: InspectorNavigationOptions): InspectorNavigation {
  const navigation: InspectorNavigation = {
    selection: { kind: "none" },
    focus: "list",
    detailScroll: 0,
    artifact: DEFAULT_ARTIFACT,
    page: "tools",
    expandedTasks: new Set<string>(),
    subagentSelection: { kind: "none" },
    openedSubagent: { kind: "none" },
    subagentScroll: 0,
    detailViewportHeight: 0,
    listScroll: 0,
    buildRows: () => buildInspectorRows(navigation),
    subagentEntries: () => activityStore.all().filter((entry) => entry.toolName === TASK_TOOL_NAME),
    selectedIndex: (rows) => {
      const index = rows.findIndex((row) => isRowSelected(row, navigation.selection));
      return index >= 0 ? index : 0;
    },
    currentRow: () => {
      const rows = navigation.buildRows();
      return findRowAt(rows, navigation.selectedIndex(rows));
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
      navigation.artifact = DEFAULT_ARTIFACT;
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
      navigation.detailScroll = clampDetailScroll(navigation.detailScroll + delta, options.detailLength(), viewport);
      options.changed();
    },
    jump: (where) => jumpInspector(navigation, options, where),
  };
  return navigation;
}
