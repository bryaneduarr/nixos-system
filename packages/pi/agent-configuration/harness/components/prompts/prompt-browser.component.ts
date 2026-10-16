import { matchesKey } from "@earendil-works/pi-tui";
import {
  KEY_CTRL_C,
  KEY_DOWN,
  KEY_ESCAPE,
  KEY_J,
  KEY_K,
  KEY_TAB,
  KEY_UP,
} from "../../constants/prompts/keys.constant.ts";
import { THEME_ACCENT, THEME_MUTED } from "../../constants/prompts/theme.constant.ts";
import { PROMPT_BROWSER_FOOTER_HINT, RENDER_CACHE_LIMIT } from "../../constants/prompts/viewer.constant.ts";
import { applyDetailKey } from "../../services/prompts/input/apply-detail-key.service.ts";
import { computeBrowserLayout } from "../../services/prompts/layout/compute-browser-layout.service.ts";
import { cursorRow } from "../../services/prompts/layout/cursor-row.service.ts";
import { frameLines } from "../../services/prompts/layout/frame-lines.service.ts";
import { joinBrowserPanes } from "../../services/prompts/layout/join-browser-panes.service.ts";
import { renderPromptList } from "../../services/prompts/layout/render-prompt-list.service.ts";
import { renderPromptRow } from "../../services/prompts/layout/render-prompt-row.service.ts";
import { safeDisplay } from "../../services/prompts/layout/safe-display.service.ts";
import { wrapPrompt } from "../../services/prompts/layout/wrap-prompt.service.ts";
import { createPromptNavigation } from "../../services/prompts/navigation/create-prompt-navigation.service.ts";
import { isSameSelectionAnchor } from "../../services/prompts/navigation/is-same-selection-anchor.service.ts";
import type { ClipboardWriter } from "../../types/prompts/clipboard-writer.interface.ts";
import type { DisplayRow } from "../../types/prompts/display-row.interface.ts";
import type { PromptBrowserHost } from "../../types/prompts/prompt-browser-host.interface.ts";
import type { PromptFocus } from "../../types/prompts/prompt-focus.interface.ts";
import type { PromptItem } from "../../types/prompts/prompt-item.interface.ts";
import type { PromptNavigation } from "../../types/prompts/prompt-navigation.interface.ts";
import type { PromptPanel } from "../../types/prompts/prompt-panel.interface.ts";
import type { PromptTheme } from "../../types/prompts/prompt-theme.interface.ts";

const WHITESPACE_RUN_PATTERN = /\s+/g;

export class PromptBrowser implements PromptPanel {
  focus: PromptFocus = "detail";
  selected = 0;
  navigation: PromptNavigation;
  private offset = 0;
  private pageSize = 1;
  private detailWidth = 1;
  private status = "";
  private closed = false;
  private readonly cache = new Map<number, DisplayRow[]>();
  private readonly summaries: string[];

  constructor(
    private readonly prompts: readonly PromptItem[],
    private readonly host: PromptBrowserHost,
    private readonly theme: PromptTheme,
    private readonly done: () => void,
    private readonly clipboard: ClipboardWriter,
  ) {
    this.navigation = createPromptNavigation(prompts.at(0)?.text ?? "");
    this.summaries = prompts.map((prompt) =>
      safeDisplay(`${prompt.label} ${prompt.text.replace(WHITESPACE_RUN_PATTERN, " ")}`),
    );
  }

  invalidate(): void {
    this.cache.clear();
  }

  private rows(): DisplayRow[] {
    let rows = this.cache.get(this.detailWidth);
    if (!rows) {
      rows = wrapPrompt(this.navigation.units, this.detailWidth);
      if (this.cache.size >= RENDER_CACHE_LIMIT) this.cache.clear();
      this.cache.set(this.detailWidth, rows);
    }
    return rows;
  }

  render(width: number): string[] {
    const columns = Math.max(0, Math.floor(width));
    const layout = computeBrowserLayout(columns, this.host.terminal.rows);
    this.detailWidth = layout.detailWidth;
    this.pageSize = layout.pageSize;
    const rows = this.rows();
    this.scrollToCursor(rows);
    const detail = rows
      .slice(this.offset, this.offset + this.pageSize)
      .map((row) => renderPromptRow(row, this.navigation, this.focus === "detail", this.theme));
    const list = renderPromptList(this.summaries, this.selected, layout, this.theme);
    const heading = this.theme.fg(
      THEME_ACCENT,
      `Prompts | ${this.focus === "list" ? "[list]" : "list"} | ${this.focus === "detail" ? "[detail]" : "detail"}`,
    );
    const footer = this.theme.fg(THEME_MUTED, this.status || PROMPT_BROWSER_FOOTER_HINT);
    const lines = [heading, ...joinBrowserPanes(layout, list, detail, this.theme), footer];
    return frameLines(lines, columns, this.theme).slice(0, layout.height);
  }

  private scrollToCursor(rows: readonly DisplayRow[]): void {
    const current = cursorRow(rows, this.navigation.cursor);
    if (current < this.offset) this.offset = current;
    if (current >= this.offset + this.pageSize) this.offset = current - this.pageSize + 1;
    this.offset = Math.max(0, Math.min(this.offset, rows.length - this.pageSize));
  }

  private select(index: number): void {
    const next = Math.max(0, Math.min(this.prompts.length - 1, index));
    if (next === this.selected) return;
    const prompt = this.prompts[next];
    if (prompt === undefined) return;
    this.selected = next;
    this.navigation = createPromptNavigation(prompt.text);
    this.offset = 0;
    this.status = "";
    this.cache.clear();
  }

  private async copy(text: string): Promise<void> {
    const navigation = this.navigation;
    const anchor = navigation.anchor;
    const cursor = navigation.cursor;
    try {
      await this.clipboard(text);
      if (this.closed) return;
      this.status = `Copied ${text.length} characters`;
      if (
        this.navigation === navigation &&
        isSameSelectionAnchor(navigation.anchor, anchor) &&
        navigation.cursor === cursor
      ) {
        navigation.anchor = { found: false };
      }
    } catch {
      if (this.closed) return;
      this.status = "Copy failed";
    }
    this.host.requestRender();
  }

  handleInput(data: string): void {
    if (matchesKey(data, KEY_CTRL_C) || (matchesKey(data, KEY_ESCAPE) && !this.navigation.anchor.found)) {
      this.closed = true;
      this.done();
      return;
    }
    if (matchesKey(data, KEY_ESCAPE)) {
      this.navigation.anchor = { found: false };
      this.navigation.pending = "";
    } else if (matchesKey(data, KEY_TAB)) {
      this.focus = this.focus === "list" ? "detail" : "list";
      this.navigation.pending = "";
    } else if (!this.handleFocusedKey(data)) {
      return;
    }
    this.host.requestRender();
  }

  private handleFocusedKey(data: string): boolean {
    if (this.focus === "list") return this.handleListKey(data);
    return applyDetailKey(data, {
      navigation: this.navigation,
      rows: () => this.rows(),
      pageSize: this.pageSize,
      copy: (text) => {
        void this.copy(text);
      },
    });
  }

  private handleListKey(data: string): boolean {
    if (matchesKey(data, KEY_J) || matchesKey(data, KEY_DOWN)) this.select(this.selected + 1);
    else if (matchesKey(data, KEY_K) || matchesKey(data, KEY_UP)) this.select(this.selected - 1);
    else return false;
    return true;
  }
}
