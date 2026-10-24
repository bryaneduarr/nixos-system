import { ONE_SENTENCE_MAX_LENGTH } from "../../../../constants/inspector/labels/sentence.constant.ts";

export function oneSentence(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const end = /[.!?](?:\s|$)/.exec(normalized);
  return normalized.slice(0, Math.min(end ? end.index + 1 : normalized.length, ONE_SENTENCE_MAX_LENGTH));
}
