import { type TuiMouseEvent, type TuiMouseEventResult, visibleWidth } from "@earendil-works/pi-tui";
import { FOOTER_LEFT_INSET, FOOTER_LINK_GAP } from "../../../constants/inspector/layout/footer-layout.constant.ts";
import { BODY_TOP_ROW, SUBAGENT_LIST_TOP_ROW } from "../../../constants/inspector/layout/page-layout.constant.ts";
import { FOOTER_LINKS } from "../../../constants/inspector/lists/footer.constant.ts";
import { PANE_DIVIDER_WIDTH } from "../../../constants/split-view/layout.constant.ts";
import { ACTIVE_MARKER } from "../../../constants/text/glyph.constant.ts";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";
import { formatFooterLink } from "../../split-view/footer/format-footer-link.service.ts";
import { rowKey } from "../navigation/row-key.service.ts";

const HANDLED: TuiMouseEventResult = { handled: true, focus: true };

function handleFooterClick(event: TuiMouseEvent, inspector: InspectorInput): boolean {
  if (event.y !== inspector.footerY) return false;
  let linkLeft = FOOTER_LEFT_INSET;
  for (const link of FOOTER_LINKS) {
    const linkWidth = visibleWidth(formatFooterLink(link, ACTIVE_MARKER));
    const isOnLink = event.x >= linkLeft && event.x < linkLeft + linkWidth;
    if (isOnLink) {
      inspector.switchPage(link.page);
      return true;
    }
    linkLeft += linkWidth + FOOTER_LINK_GAP;
  }
  return false;
}

function handleSubagentRowClick(event: TuiMouseEvent, inspector: InspectorInput): boolean {
  const isSubagentRowLine =
    inspector.page === "subagents" && event.y >= SUBAGENT_LIST_TOP_ROW && event.y < inspector.footerY;
  if (!isSubagentRowLine) return false;
  const row = inspector.subagentEntries()[inspector.subagentScroll + event.y - SUBAGENT_LIST_TOP_ROW];
  if (!row) return false;
  inspector.selectSubagent(row.id);
  return true;
}

function handleToolRowClick(event: TuiMouseEvent, inspector: InspectorInput): boolean {
  const layoutState = inspector.layout;
  if (layoutState.kind === "none") return false;
  const layout = layoutState.layout;
  const rowOffset = event.y - BODY_TOP_ROW;
  const isOutsideBody = rowOffset < 0 || rowOffset >= layout.bodyHeight;
  if (isOutsideBody) return false;

  const isInDetailPane = layout.twoPane
    ? event.x >= layout.leftWidth + PANE_DIVIDER_WIDTH
    : rowOffset >= layout.listHeight;
  if (isInDetailPane) {
    inspector.focusDetail();
    return true;
  }
  if (rowOffset >= layout.listHeight) return false;

  const row = layout.rows[inspector.listScroll + rowOffset];
  if (!row) return false;
  inspector.select(rowKey(row));
  return true;
}

export function handleInspectorMouse(event: TuiMouseEvent, inspector: InspectorInput): TuiMouseEventResult | undefined {
  if (event.type !== "click" || event.button !== "left") return undefined;

  const isHandled =
    handleFooterClick(event, inspector) ||
    handleSubagentRowClick(event, inspector) ||
    handleToolRowClick(event, inspector);
  return isHandled ? HANDLED : undefined;
}
