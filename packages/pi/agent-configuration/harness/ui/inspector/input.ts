import { matchesKey, type TuiMouseEvent, type TuiMouseEventResult, visibleWidth } from "@earendil-works/pi-tui";
import { PANE_DIVIDER_WIDTH } from "../../constants/inspector/layout.constant.ts";
import type { InspectorInput } from "../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";

export function handleInspectorKey(data: string, inspector: InspectorInput): void {
  if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q") {
    inspector.close();
    return;
  }
  const destinations: Record<string, InspectorPage> = {
    "1": "tools",
    "2": "subagents",
    "3": "messages",
  };
  if (destinations[data]) {
    inspector.switchPage(destinations[data]);
    return;
  }
  if (matchesKey(data, "tab")) {
    inspector.switchFocus();
    return;
  }
  if (matchesKey(data, "left") || matchesKey(data, "right") || data === "h" || data === "l") {
    const direction = matchesKey(data, "left") || data === "h" ? "left" : "right";
    if (inspector.page === "subagents" && direction === "right") {
      inspector.openSubagent();
      return;
    }
    if (inspector.page === "tools" && inspector.collapse(direction)) return;
    inspector.switchFocus();
    return;
  }
  if (data === "c") {
    inspector.copy();
    return;
  }
  if (data === "a") {
    inspector.toggleArtifact();
    return;
  }
  if (matchesKey(data, "pageDown")) {
    inspector.step(inspector.pageSize());
    return;
  }
  if (matchesKey(data, "pageUp")) {
    inspector.step(-inspector.pageSize());
    return;
  }
  if (matchesKey(data, "down") || data === "j") {
    inspector.step(1);
    return;
  }
  if (matchesKey(data, "up") || data === "k") {
    inspector.step(-1);
    return;
  }
  if (data === "g") {
    inspector.jump("start");
    return;
  }
  if (data === "G") inspector.jump("end");
}

export function handleInspectorMouse(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  if (event.type !== "click" || event.button !== "left") return undefined;
  if (event.y === inspector.footerY) {
    const destinations: { page: InspectorPage; width: number }[] = [
      { page: "tools", width: visibleWidth("◆ 1 Tools") },
      { page: "subagents", width: visibleWidth("◆ 2 Subagents") },
      { page: "messages", width: visibleWidth("◆ 3 Messages") },
    ];
    let left = 2;
    for (const destination of destinations) {
      if (event.x >= left && event.x < left + destination.width) {
        inspector.switchPage(destination.page);
        return { handled: true, focus: true };
      }
      left += destination.width + 2;
    }
  }
  if (inspector.page === "subagents" && event.y >= 5 && event.y < inspector.footerY) {
    const row = inspector.subagentEntries()[inspector.subagentScroll + event.y - 5];
    if (row) {
      inspector.selectSubagent(row.id);
      return { handled: true, focus: true };
    }
  }
  const layoutState = inspector.layout;
  if (layoutState.kind === "none") return undefined;
  const layout = layoutState.layout;
  const rowOffset = event.y - layout.bodyTop;
  if (rowOffset < 0 || rowOffset >= layout.bodyHeight) return undefined;
  if (
    (layout.twoPane && event.x >= layout.leftWidth + PANE_DIVIDER_WIDTH) ||
    (!layout.twoPane && rowOffset >= layout.listHeight)
  ) {
    inspector.focusDetail();
    return { handled: true, focus: true };
  }
  if (rowOffset >= layout.listHeight) return undefined;
  const row = layout.rows[inspector.listScroll + rowOffset];
  if (!row) return undefined;
  inspector.select(row.level === "sub" ? `${row.entry.id}::${row.sub.id}` : row.entry.id);
  return { handled: true, focus: true };
}
