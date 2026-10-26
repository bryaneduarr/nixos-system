import { SUBAGENT_STEP_CHROME_ROWS } from "../../../constants/inspector/navigation/scroll.constant.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorNavigationOptions } from "../../../types/inspector/navigation/inspector-navigation-options.interface.ts";
import { isSubagentSelected } from "../subagents/is-subagent-selected.service.ts";

export function stepSubagents(
  navigation: InspectorNavigation,
  options: InspectorNavigationOptions,
  delta: number,
): void {
  const rows = navigation.subagentEntries();
  if (rows.length === 0) return;
  const current = Math.max(
    0,
    rows.findIndex((row) => isSubagentSelected(row, navigation.subagentSelection)),
  );
  const next = Math.max(0, Math.min(rows.length - 1, current + delta));
  const nextRow = rows[next];
  if (nextRow) navigation.subagentSelection = { kind: "selected", id: nextRow.id };
  const pageRows = Math.max(1, options.bodyHeight() - SUBAGENT_STEP_CHROME_ROWS);
  const maxScroll = Math.max(0, rows.length - pageRows);
  navigation.subagentScroll = Math.min(maxScroll, Math.max(0, next - pageRows + 1));
  options.changed();
}
