import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { copyToClipboard, type Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TUI, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import { ACTIVITY_REFRESH_INTERVAL_MS } from "../../constants/inspector/layout.constant.ts";
import { buildDetail } from "../../services/inspector/detail/build-detail.service.ts";
import { wrappedDetail } from "../../services/inspector/detail/wrapped-detail.service.ts";
import { handleInspectorKey } from "../../services/inspector/input/handle-inspector-key.service.ts";
import { handleInspectorMouse } from "../../services/inspector/input/handle-inspector-mouse.service.ts";
import { bodyHeight } from "../../services/inspector/layout/body-height.service.ts";
import { detailWidth } from "../../services/inspector/layout/detail-width.service.ts";
import { createInspectorNavigation } from "../../services/inspector/navigation/create-inspector-navigation.service.ts";
import type { DetailArtifact } from "../../types/inspector/detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorInput } from "../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorNavigation } from "../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorOptions } from "../../types/inspector/overlay/inspector-options.interface.ts";
import type { InspectorLayoutState } from "../../types/inspector/view/inspector-layout.interface.ts";
import { renderInspector } from "./render-inspector.component.ts";

export class ActivityInspector implements Component {
  private readonly tui: TUI;
  private readonly theme: Theme;
  private readonly done: () => void;
  private readonly unsubscribe: () => void;
  private readonly navigation: InspectorNavigation;
  private status = "";
  private layout: InspectorLayoutState = { kind: "none" };
  private renderWidth = 80;
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
    return {
      page: this.navigation.page,
      footerY: this.footerY,
      layout: this.layout,
      subagentScroll: this.navigation.subagentScroll,
      listScroll: this.navigation.listScroll,
      close: () => this.done(),
      switchPage: (page) => {
        this.navigation.page = page;
        this.navigation.focus = "list";
        this.navigation.detailScroll = 0;
        this.navigation.artifact = { kind: "tool-result" };
        this.status = "";
        this.tui.requestRender();
      },
      switchFocus: () => {
        this.navigation.focus = this.navigation.focus === "list" ? "detail" : "list";
        this.tui.requestRender();
      },
      focusDetail: () => {
        this.navigation.focus = "detail";
        this.tui.requestRender();
      },
      openSubagent: () => {
        const selection = this.navigation.subagentSelection;
        if (selection.kind !== "selected") return;
        this.navigation.page = "tools";
        this.navigation.selection = { kind: "row", id: selection.id };
        this.navigation.focus = "detail";
        this.navigation.detailScroll = 0;
        this.navigation.artifact = { kind: "tool-result" };
        this.status = "";
        this.tui.requestRender();
      },
      collapse: (direction) => this.navigation.adjustSubagentCollapse(direction),
      copy: () => {
        void this.copySelection();
      },
      toggleArtifact: () => {
        void this.toggleArtifact();
      },
      pageSize: () => Math.max(1, bodyHeight(this.tui.terminal.rows) - 2),
      step: (delta) => this.navigation.step(delta),
      jump: (where) => this.navigation.jump(where),
      subagentEntries: () => this.navigation.subagentEntries(),
      selectSubagent: (id) => {
        this.navigation.subagentSelection = { kind: "selected", id };
        this.tui.requestRender();
      },
      select: (id) => this.navigation.select(id),
    };
  }

  private detailLineCount(): number {
    const lookup = this.navigation.currentRow();
    const row = lookup.found ? lookup.row : undefined;
    return wrappedDetail(row, detailWidth(this.renderWidth), this.theme, this.navigation.artifact).length;
  }

  private plainDetail(row: InspectorRow): string {
    return buildDetail({
      row,
      width: Math.max(1, detailWidth(this.renderWidth)),
      artifact: this.navigation.artifact,
    })
      .map((line) => line.text)
      .join("\n");
  }

  private async copySelection(): Promise<void> {
    const lookup = this.navigation.currentRow();
    if (!lookup.found) {
      this.setStatus("nothing selected");
      return;
    }
    const text = loadedText(this.navigation.artifact) ?? this.plainDetail(lookup.row);
    try {
      await copyToClipboard(text);
      this.setStatus(`copied ${text.length} chars`);
    } catch (error) {
      this.setStatus(`copy failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async toggleArtifact(): Promise<void> {
    if (this.navigation.artifact.kind === "loaded") {
      this.navigation.artifact = { kind: "tool-result" };
      this.navigation.detailScroll = 0;
      this.setStatus("showing tool result");
      return;
    }
    const lookup = this.navigation.currentRow();
    const path = lookup.found && lookup.row.entry.artifactPath.found ? lookup.row.entry.artifactPath.path : undefined;
    if (!lookup.found || path === undefined) {
      this.setStatus("no saved artifact for this call");
      return;
    }
    try {
      const absolute = isAbsolute(path) ? path : resolve(lookup.row.entry.cwd, path);
      const content = await readFile(absolute, "utf8");
      this.navigation.artifact = { kind: "loaded", text: content };
      this.navigation.detailScroll = 0;
      this.setStatus(`loaded ${path} (${content.length} chars)`);
    } catch {
      this.setStatus(`could not read ${path}`);
    }
  }

  private setStatus(message: string): void {
    this.status = message;
    this.tui.requestRender();
  }
}

function loadedText(artifact: DetailArtifact): string | undefined {
  return artifact.kind === "loaded" ? artifact.text : undefined;
}
