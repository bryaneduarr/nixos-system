import { THINKING_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";
import { readMessageEntries } from "../messages/read-message-entries.service.ts";

const TITLE_PATTERN = /^(?:\*\*(.+?)\*\*|#{1,6}\s+(.+))$/;

export function readThinkingTitles(messageNumber: number): string[] {
  const titles = readMessageEntries(messageNumber)
    .filter((entry) => entry.toolName === THINKING_ACTIVITY_NAME)
    .flatMap((entry) => entry.text.split("\n").flatMap(readLineTitle));
  return titles.filter((title, index) => titles.indexOf(title) === index);
}

function readLineTitle(line: string): string[] {
  const match = line.trim().match(TITLE_PATTERN);
  if (match === null) return [];
  const titleText = match[1] ?? match[2];
  return titleText === undefined ? [] : [oneLine(titleText)];
}
