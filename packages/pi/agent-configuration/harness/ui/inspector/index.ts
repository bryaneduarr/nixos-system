import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { copyToClipboard } from "@earendil-works/pi-coding-agent";
import type { Component, TUI, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import { buildDetail, type InspectorRow } from "./detail.ts";
import { handleInspectorKey, handleInspectorMouse, type InspectorInput, type InspectorLayout } from "./input.ts";
import { InspectorNavigation } from "./navigation.ts";
import { bodyHeight, detailWidth, renderInspector, wrappedDetail } from "./view.ts";

interface InspectorOptions {
  tui: TUI;
  theme: Theme;
  done: () => void;
  selectId?: string;
}

let inspectorOpen = false;

class ActivityInspector implements Component {
  private readonly tui: TUI;
  private readonly theme: Theme;
  private readonly done: () => void;
  private readonly unsubscribe: () => void;

  private readonly navigation: InspectorNavigation;
  private status = "";
  private layout: InspectorLayout | undefined;
  private renderWidth = 80;
  private readonly timer: ReturnType<typeof setInterval>;
  private footerY = 0;

  constructor(options: InspectorOptions) {
    this.tui = options.tui;
    this.theme = options.theme;
    this.done = options.done;
    this.navigation = new InspectorNavigation(
      () => bodyHeight(this.tui.terminal.rows),
      () => this.wrappedDetail(this.navigation.buildRows()).length,
      () => this.tui.requestRender(),
    );
    if (options.selectId) this.navigation.selectedId = options.selectId;
    this.unsubscribe = activityStore.subscribe(() => this.tui.requestRender());
    this.timer = setInterval(() => this.tui.requestRender(), 1000);
  }

  dispose(): void {
    this.unsubscribe();
    clearInterval(this.timer);
  }

  invalidate(): void {
    return;
  }

  private get input(): InspectorInput {
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
        this.navigation.artifactText = undefined;
        this.status = "";
        this.requestRender();
      },
      switchFocus: () => {
        this.navigation.focus = this.navigation.focus === "list" ? "detail" : "list";
        this.requestRender();
      },
      focusDetail: () => {
        this.navigation.focus = "detail";
        this.requestRender();
      },
      openSubagent: () => {
        if (!this.navigation.subagentSelectedId) return;
        this.navigation.page = "tools";
        this.navigation.selectedId = this.navigation.subagentSelectedId;
        this.navigation.focus = "detail";
        this.navigation.detailScroll = 0;
        this.navigation.artifactText = undefined;
        this.status = "";
        this.requestRender();
      },
      collapse: (direction) => this.navigation.adjustSubagentCollapse(direction),
      copy: () => {
        void this.copySelection();
      },
      toggleArtifact: () => {
        void this.toggleArtifact();
      },
      pageSize: () => this.pageSize(),
      step: (delta) => this.navigation.step(delta),
      jump: (where) => this.navigation.jump(where),
      subagentEntries: () => this.navigation.subagentEntries(),
      selectSubagent: (id) => {
        this.navigation.subagentSelectedId = id;
        this.requestRender();
      },
      select: (id) => this.navigation.select(id),
    };
  }

  handleInput(data: string): void {
    handleInspectorKey(data, this.input);
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    return handleInspectorMouse(event, this.input);
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
      artifactText: this.navigation.artifactText,
      subagents: this.navigation.subagentEntries(),
      subagentSelectedId: this.navigation.subagentSelectedId,
      subagentScroll: this.navigation.subagentScroll,
      listScroll: this.navigation.listScroll,
      detailScroll: this.navigation.detailScroll,
    });
    this.layout = result.layout;
    this.footerY = result.footerY;
    this.navigation.detailViewportHeight = result.detailViewportHeight;
    this.navigation.subagentSelectedId = result.subagentSelectedId;
    this.navigation.subagentScroll = result.subagentScroll;
    this.navigation.listScroll = result.listScroll;
    this.navigation.detailScroll = result.detailScroll;
    return result.lines;
  }

  private wrappedDetail(rows: InspectorRow[]): string[] {
    return wrappedDetail(
      this.navigation.currentRow(rows),
      detailWidth(this.renderWidth),
      this.theme,
      this.navigation.artifactText,
    );
  }

  private detailLines(row: InspectorRow) {
    return buildDetail({
      row,
      width: Math.max(1, detailWidth(this.renderWidth)),
      artifactText: this.navigation.artifactText,
    });
  }

  private plainDetail(row: InspectorRow): string {
    return this.detailLines(row)
      .map((line) => line.text)
      .join("\n");
  }

  private pageSize(): number {
    return Math.max(1, bodyHeight(this.tui.terminal.rows) - 2);
  }

  private async copySelection(): Promise<void> {
    const row = this.navigation.currentRow();
    if (!row) {
      this.setStatus("nothing selected");
      return;
    }
    const text = this.navigation.artifactText ?? this.plainDetail(row);
    try {
      await copyToClipboard(text);
      this.setStatus(`copied ${text.length} chars`);
    } catch (error) {
      this.setStatus(`copy failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async toggleArtifact(): Promise<void> {
    if (this.navigation.artifactText) {
      this.navigation.artifactText = undefined;
      this.navigation.detailScroll = 0;
      this.setStatus("showing tool result");
      return;
    }
    const row = this.navigation.currentRow();
    const path = row === undefined || !row.entry.artifactPath.found ? undefined : row.entry.artifactPath.path;
    if (!row || path === undefined) {
      this.setStatus("no saved artifact for this call");
      return;
    }
    try {
      const absolute = isAbsolute(path) ? path : resolve(row.entry.cwd, path);
      const content = await readFile(absolute, "utf8");
      this.navigation.artifactText = content;
      this.navigation.detailScroll = 0;
      this.setStatus(`loaded ${path} (${content.length} chars)`);
    } catch {
      this.setStatus(`could not read ${path}`);
    }
  }

  private setStatus(message: string): void {
    this.status = message;
    this.requestRender();
  }

  private requestRender(): void {
    this.tui.requestRender();
  }
}

export async function openInspector(ctx: ExtensionContext, options: { selectId?: string } = {}): Promise<void> {
  if (inspectorOpen) return;
  inspectorOpen = true;
  try {
    await ctx.ui.custom<void>(
      (tui, theme, _keybindings, done) => new ActivityInspector({ tui, theme, done, selectId: options.selectId }),
      {
        overlay: true,
        overlayOptions: {
          anchor: "center",
          width: "92%",
          minWidth: 56,
          maxHeight: "88%",
          margin: 1,
        },
      },
    );
  } finally {
    inspectorOpen = false;
  }
}
