import { activityStore } from "../../activity/store.ts";
import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../constants/activity/activity-entry.constant.ts";
import { readInspectorGeometry } from "../../services/inspector/layout/read-inspector-geometry.service.ts";
import type { InspectorLayoutState } from "../../types/inspector/view/inspector-layout.interface.ts";
import type { InspectorViewResult, InspectorViewState } from "../../types/inspector/view/inspector-view.interface.ts";
import { activityHeader } from "./activity-header.component.ts";
import { frameModal } from "./frame-modal.component.ts";
import { idlePrompt } from "./idle-prompt.component.ts";
import { inspectorFooter } from "./inspector-footer.component.ts";
import { renderSubagentsPage } from "./subagents-page.component.ts";
import { renderToolsPage } from "./tools-page.component.ts";

export function renderInspector(state: InspectorViewState): InspectorViewResult {
  const { width, theme, page, focus, rows } = state;
  const geometry = readInspectorGeometry(width, state.terminalRows);
  const activityEntries = activityStore.all();
  const totalCalls = activityEntries.filter(
    (entry) =>
      entry.toolName !== THINKING_ACTIVITY_NAME &&
      entry.toolName !== MESSAGE_ACTIVITY_NAME &&
      entry.toolName !== UPDATE_ACTIVITY_NAME,
  ).length;
  const phase = activityStore.currentAgent().phase;
  const active = phase === "thinking" || phase === "working" || phase === "responding";
  const lines = activityHeader(theme, geometry.contentWidth, totalCalls, active);

  let layout: InspectorLayoutState = { kind: "none" };
  let { detailScroll, subagentScroll, subagentSelection, listScroll } = state;

  if (activityEntries.length === 0 && phase === "idle") {
    lines.push(...idlePrompt(geometry.contentWidth, theme));
  } else if (page === "subagents") {
    const subagentsPage = renderSubagentsPage({
      subagents: state.subagents,
      selection: subagentSelection,
      scroll: subagentScroll,
      width: geometry.contentWidth,
      height: geometry.height,
      theme,
    });
    lines.push(...subagentsPage.lines);
    subagentSelection = subagentsPage.selection;
    subagentScroll = subagentsPage.scroll;
  } else {
    const toolsPage = renderToolsPage({
      page,
      focus,
      rows,
      selected: state.selected,
      expandedTasks: state.expandedTasks,
      artifact: state.artifact,
      listScroll,
      detailScroll,
      geometry,
      theme,
    });
    lines.push(...toolsPage.lines);
    layout = toolsPage.layout;
    listScroll = toolsPage.listScroll;
    detailScroll = toolsPage.detailScroll;
  }

  const footerY = lines.length + 1;
  lines.push(inspectorFooter(page, state.status, geometry.contentWidth, theme));

  return {
    lines: frameModal(lines, width, theme),
    layout,
    footerY,
    detailViewportHeight: geometry.detailHeight,
    subagentSelection,
    subagentScroll,
    listScroll,
    detailScroll,
  };
}
