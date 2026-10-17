import { readSpinnerFrame } from "./read-spinner-frame.service.ts";

export function readActivityMark(working: boolean, expanded: boolean, runningCount: number, frame: number): string {
  if (!working) return "done";
  const isShowingRunningTools = runningCount > 0 && expanded;
  if (isShowingRunningTools) return "·";
  return readSpinnerFrame(frame);
}
