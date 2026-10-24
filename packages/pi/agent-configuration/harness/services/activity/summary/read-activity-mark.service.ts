import type { ReadActivityMarkInput } from "../../../types/activity/summary/read-activity-mark-input.interface.ts";
import { readSpinnerFrame } from "./read-spinner-frame.service.ts";

export function readActivityMark(input: ReadActivityMarkInput): string {
  const { working, expanded, runningCount, frame } = input;
  if (!working) return "done";
  const isShowingRunningTools = runningCount > 0 && expanded;
  if (isShowingRunningTools) return "·";
  return readSpinnerFrame(frame);
}
