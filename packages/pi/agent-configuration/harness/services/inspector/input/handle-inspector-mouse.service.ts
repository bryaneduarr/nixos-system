import { type TuiMouseEvent, type TuiMouseEventResult, visibleWidth } from "@earendil-works/pi-tui";
import {
  BODY_TOP_ROW,
  FOOTER_LEFT_INSET,
  FOOTER_LINK_GAP,
  PANE_DIVIDER_WIDTH,
  SUBAGENT_LIST_TOP_ROW,
} from "../../../constants/inspector/layout.constant.ts";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";
import { rowKey } from "../navigation/row-key.service.ts";

const HANDLED: TuiMouseEventResult = { handled: true, focus: true };

const FOOTER_DESTINATIONS: { page: InspectorPage; width: number }[] = [
  { page: "tools", width: visibleWidth("◆ 1 Tools") },
  { page: "subagents", width: visibleWidth("◆ 2 Subagents") },
  { page: "messages", width: visibleWidth("◆ 3 Messages") },
];

function footerPageAt(x: number): InspectorPage | undefined {
  let left = FOOTER_LEFT_INSET;
  for (const destination of FOOTER_DESTINATIONS) {
    if (x >= left && x < left + destination.width) return destination.page;
    left += destination.width + FOOTER_LINK_GAP;
  }
  return undefined;
}

function handleFooterClick(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  if (event.y !== inspector.footerY) return undefined;
  const page = footerPageAt(event.x);
  if (page === undefined) return undefined;
  inspector.switchPage(page);
  return HANDLED;
}

function handleSubagentRowClick(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  const isSubagentRowLine =
    inspector.page === "subagents" && event.y >= SUBAGENT_LIST_TOP_ROW && event.y < inspector.footerY;
  if (!isSubagentRowLine) return undefined;
  const row = inspector.subagentEntries()[inspector.subagentScroll + event.y - SUBAGENT_LIST_TOP_ROW];
  if (!row) return undefined;
  inspector.selectSubagent(row.id);
  return HANDLED;
}

function handleToolRowClick(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  const layoutState = inspector.layout;
  if (layoutState.kind === "none") return undefined;
  const layout = layoutState.layout;
  const rowOffset = event.y - BODY_TOP_ROW;
  if (rowOffset < 0 || rowOffset >= layout.bodyHeight) return undefined;

  const isInDetailPane = layout.twoPane
    ? event.x >= layout.leftWidth + PANE_DIVIDER_WIDTH
    : rowOffset >= layout.listHeight;
  if (isInDetailPane) {
    inspector.focusDetail();
    return HANDLED;
  }
  if (rowOffset >= layout.listHeight) return undefined;

  const row = layout.rows[inspector.listScroll + rowOffset];
  if (!row) return undefined;
  inspector.select(rowKey(row));
  return HANDLED;
}

export function handleInspectorMouse(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  if (event.type !== "click" || event.button !== "left") return undefined;

  return (
    handleFooterClick(event, inspector) ??
    handleSubagentRowClick(event, inspector) ??
    handleToolRowClick(event, inspector)
  );
}
