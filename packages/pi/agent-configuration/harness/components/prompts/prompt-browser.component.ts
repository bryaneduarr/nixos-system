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
import { applyDetailKey } from "../../services/prompts/apply-detail-key.service.ts";
import { computeBrowserLayout } from "../../services/prompts/layout/compute-browser-layout.service.ts";
import { computeScrollOffset } from "../../services/prompts/layout/compute-scroll-offset.service.ts";
import { createDisplayRowCache } from "../../services/prompts/layout/create-display-row-cache.service.ts";
import { cursorRow } from "../../services/prompts/layout/cursor-row.service.ts";
import { renderBrowserLines } from "../../services/prompts/layout/render-browser-lines.service.ts";
import { summarizePrompt } from "../../services/prompts/layout/summarize-prompt.service.ts";
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

export class PromptBrowser implements PromptPanel {
  focus: PromptFocus = "detail";
  selected = 0;
  navigation: PromptNavigation;
  private offset = 0;
  private pageSize = 1;
  private detailWidth = 1;
  private status = "";
  private closed = false;
  private readonly rowCache = createDisplayRowCache();
  private readonly summaries: string[];

  constructor(
    private readonly prompts: readonly PromptItem[],
    private readonly host: PromptBrowserHost,
    private readonly theme: PromptTheme,
    private readonly done: () => void,
    private readonly clipboard: ClipboardWriter,
  ) {
    const firstPrompt = prompts.at(0);
    this.navigation = createPromptNavigation(firstPrompt === undefined ? "" : firstPrompt.text);
    this.summaries = prompts.map(summarizePrompt);
  }

  invalidate(): void {
    this.rowCache.clear();
  }

  render(width: number): string[] {
    const columns = Math.max(0, Math.floor(width));
    const layout = computeBrowserLayout(columns, this.host.terminal.rows);
    this.detailWidth = layout.detailWidth;
    this.pageSize = layout.pageSize;
    const rows = this.rowCache.rows(this.navigation.units, this.detailWidth);
    this.scrollToCursor(rows);
    return renderBrowserLines({
      columns,
      layout,
      rows,
      offset: this.offset,
      navigation: this.navigation,
      focus: this.focus,
      selected: this.selected,
      summaries: this.summaries,
      status: this.status,
      theme: this.theme,
    });
  }

  private scrollToCursor(rows: readonly DisplayRow[]): void {
    const cursorRowIndex = cursorRow(rows, this.navigation.cursor);
    this.offset = computeScrollOffset(this.offset, cursorRowIndex, this.pageSize, rows.length);
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
    this.rowCache.clear();
  }

  private async copy(text: string): Promise<void> {
    const navigation = this.navigation;
    const anchor = navigation.anchor;
    const cursor = navigation.cursor;
    try {
      await this.clipboard(text);
      if (this.closed) return;
      this.status = `Copied ${text.length} characters`;
      const isSelectionUnchangedSinceCopy =
        this.navigation === navigation &&
        isSameSelectionAnchor(navigation.anchor, anchor) &&
        navigation.cursor === cursor;
      if (isSelectionUnchangedSinceCopy) navigation.anchor = { found: false };
    } catch {
      if (this.closed) return;
      this.status = "Copy failed";
    }
    this.host.requestRender();
  }

  handleInput(sequence: string): void {
    const isEscapeWithoutSelection = matchesKey(sequence, KEY_ESCAPE) && !this.navigation.anchor.found;
    if (matchesKey(sequence, KEY_CTRL_C) || isEscapeWithoutSelection) {
      this.closed = true;
      this.done();
      return;
    }
    if (matchesKey(sequence, KEY_ESCAPE)) {
      this.navigation.anchor = { found: false };
      this.navigation.pending = "";
    } else if (matchesKey(sequence, KEY_TAB)) {
      this.focus = this.focus === "list" ? "detail" : "list";
      this.navigation.pending = "";
    } else if (!this.handleFocusedKey(sequence)) {
      return;
    }
    this.host.requestRender();
  }

  private handleFocusedKey(sequence: string): boolean {
    if (this.focus === "list") return this.handleListKey(sequence);
    return applyDetailKey(sequence, {
      navigation: this.navigation,
      rows: () => this.rowCache.rows(this.navigation.units, this.detailWidth),
      pageSize: this.pageSize,
      copy: (text) => void this.copy(text),
    });
  }

  private handleListKey(sequence: string): boolean {
    if (matchesKey(sequence, KEY_J) || matchesKey(sequence, KEY_DOWN)) this.select(this.selected + 1);
    else if (matchesKey(sequence, KEY_K) || matchesKey(sequence, KEY_UP)) this.select(this.selected - 1);
    else return false;
    return true;
  }
}
