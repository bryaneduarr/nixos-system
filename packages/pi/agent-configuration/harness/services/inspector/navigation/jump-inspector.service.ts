import { SUBAGENT_JUMP_CHROME_ROWS } from "../../../constants/inspector/navigation/scroll.constant.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorNavigationOptions } from "../../../types/inspector/navigation/inspector-navigation-options.interface.ts";
import { rowKey } from "./row-key.service.ts";

export function jumpInspector(
  navigation: InspectorNavigation,
  options: InspectorNavigationOptions,
  where: "start" | "end",
): void {
  if (navigation.page === "subagents") {
    const rows = navigation.subagentEntries();
    const row = where === "start" ? rows[0] : rows[rows.length - 1];
    if (row) {
      navigation.subagentSelection = { kind: "selected", id: row.id };
      const pageRows = Math.max(1, options.bodyHeight() - SUBAGENT_JUMP_CHROME_ROWS);
      navigation.subagentScroll = where === "start" ? 0 : Math.max(0, rows.length - pageRows);
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
