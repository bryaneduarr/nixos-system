import { SPINNER_FRAMES } from "../../../constants/activity/spinner.constant.ts";

export function readSpinnerFrame(frame: number): string {
  return SPINNER_FRAMES[frame % SPINNER_FRAMES.length] ?? "";
}
