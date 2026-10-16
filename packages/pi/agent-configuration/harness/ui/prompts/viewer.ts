import { copyToClipboard, type ExtensionContext, type Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, type TUI } from "@earendil-works/pi-tui";
import { cursorRow, type DisplayRow, fit, frame, moveVertical, renderRow, safeDisplay, wrapPrompt } from "./layout.ts";
import { type PromptItem, PromptNavigation } from "./model.ts";

export type ClipboardWriter = (text: string) => void | Promise<void>;

export class PromptBrowser {
  focus: "list" | "detail" = "detail";
  selected = 0;
  navigation: PromptNavigation;
  private offset = 0;
  private pageSize = 1;
  private detailWidth = 1;
  private status = "";
  private closed = false;
  private cache = new Map<number, DisplayRow[]>();
  private summaries: string[];

  constructor(
    readonly prompts: PromptItem[],
    private tui: TUI,
    private theme: Theme,
    private done: () => void,
    private clipboard: ClipboardWriter = copyToClipboard,
  ) {
    this.navigation = new PromptNavigation(prompts[0]?.text ?? "");
    this.summaries = prompts.map((prompt) => safeDisplay(`${prompt.label} ${prompt.text.replace(/\s+/g, " ")}`));
  }

  invalidate(): void {
    this.cache.clear();
  }

  private rows(): DisplayRow[] {
    let rows = this.cache.get(this.detailWidth);
    if (!rows) {
      rows = wrapPrompt(this.navigation.units, this.detailWidth);
      if (this.cache.size >= 4) this.cache.clear();
      this.cache.set(this.detailWidth, rows);
    }
    return rows;
  }

  render(width: number): string[] {
    width = Math.max(0, Math.floor(width));
    const height = Math.max(1, Math.min(this.tui.terminal.rows, Math.floor(this.tui.terminal.rows * 0.88)));
    const inner = Math.max(0, width - 2);
    const body = Math.max(1, height - 4);
    const stacked = width < 64;
    const listWidth = stacked ? inner : Math.max(16, Math.floor(inner * 0.3));
    const listHeight = stacked ? Math.min(3, Math.max(1, Math.floor(body / 3))) : body;
    this.detailWidth = Math.max(1, stacked ? inner : inner - listWidth - 3);
    this.pageSize = Math.max(1, stacked ? body - listHeight - 1 : body);
    const rows = this.rows();
    const current = cursorRow(rows, this.navigation.cursor);
    if (current < this.offset) this.offset = current;
    if (current >= this.offset + this.pageSize) this.offset = current - this.pageSize + 1;
    this.offset = Math.max(0, Math.min(this.offset, rows.length - this.pageSize));
    const detail = rows
      .slice(this.offset, this.offset + this.pageSize)
      .map((row) => renderRow(row, this.navigation, this.focus === "detail", this.theme));
    const listStart = Math.max(0, this.selected - listHeight + 1);
    const list = this.summaries.slice(listStart, listStart + listHeight).map((summary, index) => {
      const active = listStart + index === this.selected;
      const label = `${active ? ">" : " "} ${summary}`;
      return this.theme.fg(active ? "accent" : "muted", fit(label, listWidth));
    });
    const heading = this.theme.fg(
      "accent",
      `Prompts | ${this.focus === "list" ? "[list]" : "list"} | ${this.focus === "detail" ? "[detail]" : "detail"}`,
    );
    const lines = [heading];
    if (stacked) {
      for (let index = 0; index < listHeight; index++) lines.push(list[index] ?? "");
      lines.push(this.theme.fg("borderMuted", "─".repeat(inner)));
      for (let index = 0; index < this.pageSize; index++) lines.push(detail[index] ?? "");
    } else {
      for (let index = 0; index < body; index++) {
        lines.push(`${fit(list[index] ?? "", listWidth)} ${this.theme.fg("borderMuted", "│")} ${detail[index] ?? ""}`);
      }
    }
    lines.push(
      this.theme.fg("muted", this.status || "Tab focus · hjkl/wb/0/$/gg/G · v/V select · y/yy/ggyG copy · Esc close"),
    );
    return frame(lines, width, this.theme).slice(0, height);
  }

  private select(index: number): void {
    const next = Math.max(0, Math.min(this.prompts.length - 1, index));
    if (next === this.selected) return;
    this.selected = next;
    this.navigation = new PromptNavigation(this.prompts[next].text);
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
      if (this.navigation === navigation && navigation.anchor === anchor && navigation.cursor === cursor) {
        navigation.anchor = undefined;
      }
    } catch {
      if (this.closed) return;
      this.status = "Copy failed";
    }
    this.tui.requestRender();
  }

  handleInput(data: string): void {
    if (matchesKey(data, "ctrl+c") || (matchesKey(data, "escape") && this.navigation.anchor === undefined)) {
      this.closed = true;
      this.done();
      return;
    }
    if (matchesKey(data, "escape")) {
      this.navigation.anchor = undefined;
      this.navigation.pending = "";
    } else if (matchesKey(data, "tab")) {
      this.focus = this.focus === "list" ? "detail" : "list";
      this.navigation.pending = "";
    } else if (this.focus === "list") {
      if (matchesKey(data, "j") || matchesKey(data, "down")) this.select(this.selected + 1);
      else if (matchesKey(data, "k") || matchesKey(data, "up")) this.select(this.selected - 1);
      else return;
    } else if (!this.detailInput(data)) return;
    this.tui.requestRender();
  }

  private detailInput(data: string): boolean {
    const navigation = this.navigation;
    const pending = navigation.pending;
    navigation.pending = "";
    if (matchesKey(data, "g")) {
      if (pending === "g") navigation.move(0);
      else navigation.pending = "g";
    } else if (matchesKey(data, "y")) {
      const selection = navigation.selectedText();
      if (selection !== undefined) void this.copy(selection);
      else if (pending === "y") void this.copy(navigation.text.slice(...navigation.lineRange()));
      else navigation.pending = "y";
    } else if (matchesKey(data, "shift+g") && pending === "y") {
      void this.copy(navigation.text.slice(navigation.lineRange()[0]));
    } else if (matchesKey(data, "v") || matchesKey(data, "shift+v"))
      navigation.toggleSelection(matchesKey(data, "v") ? "character" : "line");
    else if (matchesKey(data, "h") || matchesKey(data, "left")) navigation.move(navigation.cursor - 1);
    else if (matchesKey(data, "l") || matchesKey(data, "right")) navigation.move(navigation.cursor + 1);
    else if (matchesKey(data, "j") || matchesKey(data, "down")) moveVertical(navigation, this.rows(), 1);
    else if (matchesKey(data, "k") || matchesKey(data, "up")) moveVertical(navigation, this.rows(), -1);
    else if (matchesKey(data, "w") || matchesKey(data, "b")) navigation.word(matchesKey(data, "w") ? 1 : -1);
    else if (matchesKey(data, "0")) navigation.lineEdge(false);
    else if (matchesKey(data, "$")) navigation.lineEdge(true);
    else if (matchesKey(data, "home")) navigation.move(0);
    else if (matchesKey(data, "shift+g") || matchesKey(data, "end")) navigation.move(navigation.units.length - 1);
    else if (matchesKey(data, "ctrl+d") || matchesKey(data, "ctrl+u")) {
      moveVertical(
        navigation,
        this.rows(),
        (matchesKey(data, "ctrl+d") ? 1 : -1) * Math.max(1, Math.floor(this.pageSize / 2)),
      );
    } else if (matchesKey(data, "pageDown") || matchesKey(data, "pageUp")) {
      moveVertical(navigation, this.rows(), (matchesKey(data, "pageDown") ? 1 : -1) * this.pageSize);
    } else return false;
    return true;
  }
}

export async function viewPrompt(
  ctx: ExtensionContext,
  prompts: string | PromptItem[],
  clipboard: ClipboardWriter = copyToClipboard,
): Promise<void> {
  const items = typeof prompts === "string" ? [{ text: prompts, label: "Latest" }] : prompts;
  await ctx.ui.custom<void>((tui, theme, _keybindings, done) => new PromptBrowser(items, tui, theme, done, clipboard), {
    overlay: true,
    overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 },
  });
}
