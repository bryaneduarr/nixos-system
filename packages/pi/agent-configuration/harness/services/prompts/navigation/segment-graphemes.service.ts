import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function segmentGraphemes(text: string): Grapheme[] {
  return Array.from(graphemeSegmenter.segment(text), (part) => ({
    text: part.segment,
    start: part.index,
    end: part.index + part.segment.length,
  }));
}
