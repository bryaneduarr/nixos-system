import type { Grapheme } from "../../types/prompts/grapheme.interface.ts";
import type { SelectedTextLookup, SelectionRangeLookup } from "../../types/prompts/selection.interface.ts";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function graphemes(text: string): Grapheme[] {
  return Array.from(segmenter.segment(text), (part) => ({
    text: part.segment,
    start: part.index,
    end: part.index + part.segment.length,
  }));
}

export class PromptNavigation {
  readonly units: Grapheme[];
  cursor = 0;
  anchor: number | undefined;
  selection: "character" | "line" = "character";
  pending = "";

  constructor(readonly text: string) {
    this.units = graphemes(text);
  }

  move(index: number): void {
    this.cursor = Math.max(0, Math.min(index, Math.max(0, this.units.length - 1)));
  }

  lineRange(index = this.cursor): [number, number] {
    const offset = this.units[index]?.start ?? 0;
    const start = offset === 0 ? 0 : this.text.lastIndexOf("\n", offset - 1) + 1;
    const newline = this.text.indexOf("\n", offset);
    return [start, newline < 0 ? this.text.length : newline + 1];
  }

  range(): SelectionRangeLookup {
    if (this.anchor === undefined) return { found: false };
    const low = Math.min(this.anchor, this.cursor);
    const high = Math.max(this.anchor, this.cursor);
    if (this.selection === "line") return { found: true, range: [this.lineRange(low)[0], this.lineRange(high)[1]] };
    return { found: true, range: [this.units[low]?.start ?? 0, this.units[high]?.end ?? 0] };
  }

  selectedText(): SelectedTextLookup {
    const selection = this.range();
    return selection.found ? { found: true, text: this.text.slice(...selection.range) } : { found: false };
  }

  toggleSelection(mode: "character" | "line"): void {
    if (this.anchor !== undefined && this.selection === mode) this.anchor = undefined;
    else {
      this.anchor ??= this.cursor;
      this.selection = mode;
    }
  }

  word(direction: number): void {
    const isWord = (index: number) => /[\p{L}\p{N}_]/u.test(this.units[index]?.text ?? "");
    const isSpace = (index: number) => /^\s+$/u.test(this.units[index]?.text ?? "");
    let index = this.cursor;
    if (direction > 0) {
      const kind = isWord(index);
      while (index < this.units.length && !isSpace(index) && isWord(index) === kind) index++;
      while (index < this.units.length && isSpace(index)) index++;
    } else {
      index--;
      while (index > 0 && isSpace(index)) index--;
      const kind = isWord(index);
      while (index > 0 && !isSpace(index - 1) && isWord(index - 1) === kind) index--;
    }
    this.move(index);
  }

  lineEdge(end: boolean): void {
    const [start, stop] = this.lineRange();
    let index = this.units.findIndex((unit) => unit.start >= start);
    if (end) {
      for (let next = index; next < this.units.length && this.units[next].start < stop; next++) {
        if (!this.units[next].text.includes("\n")) index = next;
      }
    }
    this.move(index);
  }
}
