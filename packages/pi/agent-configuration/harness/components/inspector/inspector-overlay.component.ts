import { copyToClipboard, type Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TUI, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { ACTIVITY_REFRESH_INTERVAL_MS, DEFAULT_RENDER_WIDTH } from "../../constants/inspector/layout.constant.ts";
import { activityStore } from "../../services/activity/store/shared-activity-store.service.ts";
import { toggleArtifact } from "../../services/inspector/artifact/toggle-artifact.service.ts";
import { buildDetail } from "../../services/inspector/detail/lines/build-detail.service.ts";
import { wrappedDetail } from "../../services/inspector/detail/lines/wrapped-detail.service.ts";
import { createInspectorInput } from "../../services/inspector/input/create-inspector-input.service.ts";
import { handleInspectorKey } from "../../services/inspector/input/handle-inspector-key.service.ts";
import { handleInspectorMouse } from "../../services/inspector/input/handle-inspector-mouse.service.ts";
import { createInspectorNavigation } from "../../services/inspector/navigation/create-inspector-navigation.service.ts";
import { bodyHeight } from "../../services/split-view/layout/body-height.service.ts";
import { readSplitViewGeometry } from "../../services/split-view/layout/read-split-view-geometry.service.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorInput } from "../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorNavigation } from "../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorOptions } from "../../types/inspector/open/inspector-options.interface.ts";
import type { InspectorLayoutState } from "../../types/inspector/view/inspector-layout.interface.ts";
import { renderInspector } from "./render-inspector.component.ts";

export class InspectorOverlay implements Component {
  private readonly tui: TUI;
  private readonly theme: Theme;
  private readonly done: () => void;
  private readonly unsubscribe: () => void;
  private readonly navigation: InspectorNavigation;
  private status = "";
  private layout: InspectorLayoutState = { kind: "none" };
  private renderWidth = DEFAULT_RENDER_WIDTH;
  private readonly timer: ReturnType<typeof setInterval>;
  private footerY = 0;

  constructor(options: InspectorOptions) {
    this.tui = options.tui;
    this.theme = options.theme;
    this.done = options.done;
    this.navigation = createInspectorNavigation({
      bodyHeight: () => bodyHeight(this.tui.terminal.rows),
      detailLength: () => this.detailLineCount(),
      changed: () => this.tui.requestRender(),
    });
    if (options.selection.kind === "tool-call") {
      this.navigation.selection = { kind: "row", id: options.selection.toolCallId };
    }
    this.unsubscribe = activityStore.subscribe(() => this.tui.requestRender());
    this.timer = setInterval(() => this.tui.requestRender(), ACTIVITY_REFRESH_INTERVAL_MS);
  }

  dispose(): void {
    this.unsubscribe();
    clearInterval(this.timer);
  }

  invalidate(): void {
    return;
  }

  handleInput(data: string): void {
    handleInspectorKey(data, this.input());
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    return handleInspectorMouse(event, this.input());
  }

  render(width: number): string[] {
    this.renderWidth = width;
    const rows = this.navigation.buildRows();
    this.navigation.syncSelection(rows);
    const result = renderInspector({
      width,
      terminalRows: this.tui.terminal.rows,
      theme: this.theme,
      page: this.navigation.page,
      focus: this.navigation.focus,
      status: this.status,
      rows,
      selected: this.navigation.selectedIndex(rows),
      expandedTasks: this.navigation.expandedTasks,
      artifact: this.navigation.artifact,
      subagents: this.navigation.subagentEntries(),
      subagentSelection: this.navigation.subagentSelection,
      subagentScroll: this.navigation.subagentScroll,
      listScroll: this.navigation.listScroll,
      detailScroll: this.navigation.detailScroll,
    });
    this.layout = result.layout;
    this.footerY = result.footerY;
    this.navigation.detailViewportHeight = result.detailViewportHeight;
    this.navigation.subagentSelection = result.subagentSelection;
    this.navigation.subagentScroll = result.subagentScroll;
    this.navigation.listScroll = result.listScroll;
    this.navigation.detailScroll = result.detailScroll;
    return result.lines;
  }

  private input(): InspectorInput {
    return createInspectorInput({
      navigation: this.navigation,
      footerY: this.footerY,
      layout: this.layout,
      terminalRows: () => this.tui.terminal.rows,
      close: () => this.done(),
      requestRender: () => this.tui.requestRender(),
      setStatus: (message) => this.setStatus(message),
      copy: () => {
        void this.copySelection();
      },
      toggleArtifact: () => {
        void toggleArtifact(this.navigation).then((message) => this.setStatus(message));
      },
    });
  }

  private detailPaneWidth(): number {
    return readSplitViewGeometry(this.renderWidth, this.tui.terminal.rows).rightWidth;
  }

  private detailLineCount(): number {
    return wrappedDetail(this.navigation.currentRow(), this.detailPaneWidth(), this.theme, this.navigation.artifact)
      .length;
  }

  private plainDetail(row: InspectorRow): string {
    return buildDetail({ row, width: this.detailPaneWidth(), artifact: this.navigation.artifact })
      .map((line) => line.text)
      .join("\n");
  }

  private async copySelection(): Promise<void> {
    const lookup = this.navigation.currentRow();
    if (!lookup.found) {
      this.setStatus("nothing selected");
      return;
    }
    const artifact = this.navigation.artifact;
    const text = artifact.kind === "loaded" ? artifact.text : this.plainDetail(lookup.row);
    try {
      await copyToClipboard(text);
      this.setStatus(`copied ${text.length} chars`);
    } catch (error) {
      this.setStatus(`copy failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private setStatus(message: string): void {
    this.status = message;
    this.tui.requestRender();
  }
}
