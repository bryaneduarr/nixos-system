import { expect, test } from "bun:test";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";
import type { SplitViewFocus } from "../../../types/split-view/split-view-focus.interface.ts";
import { handleInspectorKey } from "./handle-inspector-key.service.ts";

function createStubbedInspectorInput(
  page: InspectorPage,
  focus: SplitViewFocus,
  switchedPages: InspectorPage[],
): InspectorInput {
  return {
    page,
    focus,
    footerY: 0,
    layout: { kind: "none" },
    subagentScroll: 0,
    listScroll: 0,
    close: () => {},
    switchPage: (destination) => {
      switchedPages.push(destination);
    },
    switchFocus: () => {},
    focusDetail: () => {},
    openSubagent: () => {
      switchedPages.push("subagent");
    },
    collapse: () => false,
    copy: () => {},
    toggleArtifact: () => {},
    pageSize: () => 10,
    step: () => {},
    jump: () => {},
    subagentEntries: () => [],
    selectSubagent: () => {},
    select: () => {},
  };
}

test("number keys open the tools, subagents, and history pages", () => {
  const switchedPages: InspectorPage[] = [];
  const inspector = createStubbedInspectorInput("tools", "list", switchedPages);

  for (const key of ["1", "2", "3"]) handleInspectorKey(key, inspector);

  expect(switchedPages).toEqual(["tools", "subagents", "history"]);
});

test("ctrl+d and ctrl+u move half a page down and up", () => {
  const steps: number[] = [];
  const inspector = { ...createStubbedInspectorInput("tools", "list", []), step: (delta: number) => steps.push(delta) };

  handleInspectorKey("\x04", inspector);
  handleInspectorKey("\x15", inspector);

  expect(steps).toEqual([5, -5]);
});

test("right opens the selected subagent and left from its list returns to the subagents", () => {
  const switchedPages: InspectorPage[] = [];

  handleInspectorKey("l", createStubbedInspectorInput("subagents", "list", switchedPages));
  handleInspectorKey("h", createStubbedInspectorInput("subagent", "list", switchedPages));
  handleInspectorKey("h", createStubbedInspectorInput("subagent", "detail", switchedPages));

  expect(switchedPages).toEqual(["subagent", "subagents"]);
});

test("enter opens a subagent from the subagents and tools pages and nowhere else", () => {
  const switchedPages: InspectorPage[] = [];

  for (const page of ["subagents", "tools", "history", "subagent"] as const) {
    handleInspectorKey("\r", createStubbedInspectorInput(page, "list", switchedPages));
  }

  expect(switchedPages).toEqual(["subagent", "subagent"]);
});
