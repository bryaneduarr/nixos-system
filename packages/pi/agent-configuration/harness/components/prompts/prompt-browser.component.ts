import { matchesKey } from "@earendil-works/pi-tui";
import { KEY_CTRL_C, KEY_ENTER, KEY_ESCAPE, KEY_TAB } from "../../constants/keys/key-name.constant.ts";
import {
  COLLECTION_BY_KEY,
  PROMPT_BROWSER_KEY_HINT,
  TURN_BROWSER_KEY_HINT,
} from "../../constants/prompts/collection.constant.ts";
import { choosePromptTurn } from "../../services/prompts/collection/choose-prompt-turn.service.ts";
import { createDisplayRowCache } from "../../services/prompts/display/create-display-row-cache.service.ts";
import { cursorRow } from "../../services/prompts/display/cursor-row.service.ts";
import { applyDetailKey } from "../../services/prompts/input/apply-detail-key.service.ts";
import { applyListKey } from "../../services/prompts/input/apply-list-key.service.ts";
import { copyPromptText } from "../../services/prompts/input/copy-prompt-text.service.ts";
import { createItemNavigation } from "../../services/prompts/navigation/create-item-navigation.service.ts";
import { renderBrowserLines } from "../../services/prompts/render/render-browser-lines.service.ts";
import { summarizeCollections } from "../../services/prompts/render/summarize-collections.service.ts";
import { computeListScroll } from "../../services/split-view/layout/compute-list-scroll.service.ts";
import { readSplitViewGeometry } from "../../services/split-view/layout/read-split-view-geometry.service.ts";
import type { DisplayRow } from "../../types/prompts/display/display-row.interface.ts";
import type { PromptNavigation } from "../../types/prompts/navigation/prompt-navigation.interface.ts";
import type { PromptBrowserOptions } from "../../types/prompts/view/prompt-browser-options.interface.ts";
import type { PromptCollectionName } from "../../types/prompts/view/prompt-collections.interface.ts";
import type { PromptPanel } from "../../types/prompts/view/prompt-panel.interface.ts";
import type { SplitViewFocus } from "../../types/split-view/split-view-focus.interface.ts";

export class PromptBrowser implements PromptPanel {
  focus: SplitViewFocus = "detail";
  collection: PromptCollectionName;
  selected = 0;
  navigation: PromptNavigation;
  private offset = 0;
  private pageSize = 1;
  private detailWidth = 1;
  private status = "";
  private closed = false;
  private readonly rowCache = createDisplayRowCache();
  private readonly summaries: Readonly<Record<PromptCollectionName, readonly string[]>>;
  constructor(private readonly options: PromptBrowserOptions) {
    const { collections } = options;
    this.collection = collections.prompts.length > 0 ? "prompts" : "outputs";
    this.navigation = createItemNavigation(collections[this.collection], 0);
    this.summaries = summarizeCollections(collections);
  }

  invalidate(): void {
    this.rowCache.clear();
  }

  render(width: number): string[] {
    const columns = Math.max(0, Math.floor(width));
    const geometry = readSplitViewGeometry(columns, this.options.host.terminal.rows);
    this.detailWidth = geometry.rightWidth;
    this.pageSize = geometry.detailHeight;
    const rows = this.rowCache.rows(this.navigation.units, this.detailWidth);
    this.scrollToCursor(rows);
    return renderBrowserLines({
      columns,
      geometry,
      rows,
      offset: this.offset,
      navigation: this.navigation,
      collection: this.collection,
      focus: this.focus,
      selected: this.selected,
      summaries: this.summaries[this.collection],
      keyHint: this.options.selection.kind === "choose-turn" ? TURN_BROWSER_KEY_HINT : PROMPT_BROWSER_KEY_HINT,
      status: this.status,
      theme: this.options.theme,
    }).slice(0, this.options.host.terminal.rows);
  }

  private scrollToCursor(rows: readonly DisplayRow[]): void {
    const cursorRowIndex = cursorRow(rows, this.navigation.cursor);
    this.offset = computeListScroll({
      previous: this.offset,
      length: rows.length,
      height: this.pageSize,
      selected: cursorRowIndex,
    });
  }

  private select(index: number): void {
    const next = Math.max(0, Math.min(this.options.collections[this.collection].length - 1, index));
    if (next !== this.selected) this.open(this.collection, next);
  }

  private open(collection: PromptCollectionName, index: number): void {
    this.collection = collection;
    this.selected = index;
    this.navigation = createItemNavigation(this.options.collections[collection], index);
    this.offset = 0;
    this.status = "";
    this.rowCache.clear();
  }

  private async copy(text: string): Promise<void> {
    const status = await copyPromptText({
      text,
      clipboard: this.options.clipboard,
      currentNavigation: () => this.navigation,
    });
    if (this.closed) return;
    this.status = status;
    this.options.host.requestRender();
  }

  handleInput(sequence: string): void {
    const isEscapeWithoutSelection = matchesKey(sequence, KEY_ESCAPE) && !this.navigation.anchor.found;
    const shownCollection = COLLECTION_BY_KEY[sequence];
    if (matchesKey(sequence, KEY_CTRL_C) || isEscapeWithoutSelection) {
      this.closed = true;
      this.options.done();
      return;
    }
    if (matchesKey(sequence, KEY_ESCAPE)) {
      this.navigation.anchor = { found: false };
      this.navigation.pending = "";
    } else if (matchesKey(sequence, KEY_ENTER)) {
      this.chooseSelectedTurn();
      return;
    } else if (shownCollection !== undefined) {
      this.open(shownCollection, 0);
    } else if (matchesKey(sequence, KEY_TAB)) {
      this.focus = this.focus === "list" ? "detail" : "list";
      this.navigation.pending = "";
    } else if (!this.handleFocusedKey(sequence)) {
      return;
    }
    this.options.host.requestRender();
  }

  private chooseSelectedTurn(): void {
    const { selection, collections, done } = this.options;
    const items = collections[this.collection];
    if (choosePromptTurn({ selection, items, selected: this.selected, done })) this.closed = true;
  }

  private handleFocusedKey(sequence: string): boolean {
    if (this.focus === "list")
      return applyListKey(sequence, { selected: this.selected, select: (index) => this.select(index) });
    return applyDetailKey(sequence, {
      navigation: this.navigation,
      rows: () => this.rowCache.rows(this.navigation.units, this.detailWidth),
      pageSize: this.pageSize,
      copy: (text) => void this.copy(text),
    });
  }
}
