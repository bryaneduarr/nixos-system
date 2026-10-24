import { DEFAULT_ARTIFACT } from "../../../constants/inspector/detail/default-artifact.constant.ts";
import { PAGE_STEP_CHROME_ROWS } from "../../../constants/inspector/navigation/scroll.constant.ts";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorInputContext } from "../../../types/inspector/input/inspector-input-context.interface.ts";
import { bodyHeight } from "../../split-view/layout/body-height.service.ts";
import { readSubagentToOpen } from "../subagents/read-subagent-to-open.service.ts";

export function createInspectorInput(context: InspectorInputContext): InspectorInput {
  const { navigation } = context;
  return {
    page: navigation.page,
    focus: navigation.focus,
    footerY: context.footerY,
    layout: context.layout,
    subagentScroll: navigation.subagentScroll,
    listScroll: navigation.listScroll,
    close: context.close,
    switchPage: (page) => {
      navigation.page = page;
      navigation.focus = "list";
      navigation.detailScroll = 0;
      navigation.artifact = DEFAULT_ARTIFACT;
      context.setStatus("");
    },
    switchFocus: () => {
      navigation.focus = navigation.focus === "list" ? "detail" : "list";
      context.requestRender();
    },
    focusDetail: () => {
      navigation.focus = "detail";
      context.requestRender();
    },
    openSubagent: () => {
      const selection = readSubagentToOpen(navigation);
      if (selection.kind !== "selected") return;
      navigation.page = "subagent";
      navigation.subagentSelection = selection;
      navigation.openedSubagent = selection;
      navigation.selection = { kind: "row", id: selection.id };
      navigation.focus = "list";
      navigation.detailScroll = 0;
      navigation.artifact = DEFAULT_ARTIFACT;
      context.setStatus("");
    },
    collapse: (direction) => navigation.adjustSubagentCollapse(direction),
    copy: context.copy,
    toggleArtifact: context.toggleArtifact,
    pageSize: () => Math.max(1, bodyHeight(context.terminalRows()) - PAGE_STEP_CHROME_ROWS),
    step: (delta) => navigation.step(delta),
    jump: (where) => navigation.jump(where),
    subagentEntries: () => navigation.subagentEntries(),
    selectSubagent: (id) => {
      navigation.subagentSelection = { kind: "selected", id };
      context.requestRender();
    },
    select: (id) => navigation.select(id),
  };
}
