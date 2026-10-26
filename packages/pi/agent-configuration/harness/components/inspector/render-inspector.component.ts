import { countToolCalls } from "../../services/inspector/entries/count-tool-calls.service.ts";
import { isAgentWorking } from "../../services/inspector/entries/is-agent-working.service.ts";
import { readSplitViewGeometry } from "../../services/split-view/layout/read-split-view-geometry.service.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import type { InspectorLayoutState } from "../../types/inspector/view/inspector-layout.interface.ts";
import type { InspectorViewResult } from "../../types/inspector/view/inspector-view-result.interface.ts";
import type { InspectorViewState } from "../../types/inspector/view/inspector-view-state.interface.ts";
import { frameModal } from "../split-view/frame-modal.component.ts";
import { activityHeader } from "./activity-header.component.ts";
import { idlePrompt } from "./idle-prompt.component.ts";
import { inspectorFooter } from "./inspector-footer.component.ts";
import { renderSubagentsPage } from "./subagents-page.component.ts";
import { renderToolsPage } from "./tools-page.component.ts";

export function renderInspector(state: InspectorViewState): InspectorViewResult {
  const { width, theme, page, focus, rows } = state;
  const geometry = readSplitViewGeometry(width, state.terminalRows);
  const activityEntries = activityStore.all();
  const phase = activityStore.currentAgent().phase;
  const lines = activityHeader({
    theme,
    width: geometry.contentWidth,
    totalCalls: countToolCalls(activityEntries),
    active: isAgentWorking(phase),
  });

  let layout: InspectorLayoutState = { kind: "none" };
  let { detailScroll, subagentScroll, subagentSelection, listScroll } = state;

  const isIdleWithoutActivity = activityEntries.length === 0 && phase === "idle";
  if (isIdleWithoutActivity) {
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
  lines.push(inspectorFooter({ page, status: state.status, width: geometry.contentWidth, theme }));

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
