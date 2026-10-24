import { SPINNER_FRAMES } from "../../../constants/activity/summary/spinner.constant.ts";

export function readSpinnerFrame(frame: number): string {
  const [firstFrame] = SPINNER_FRAMES;
  const currentFrame = SPINNER_FRAMES[frame % SPINNER_FRAMES.length];
  return currentFrame === undefined ? firstFrame : currentFrame;
}
