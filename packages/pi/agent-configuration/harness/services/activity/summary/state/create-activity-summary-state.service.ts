import type { ActivitySummaryState } from "../../../../types/activity/summary/activity-summary-state.interface.ts";

export function createActivitySummaryState(): ActivitySummaryState {
  const completions = new Map<number, number>();
  let working = false;
  let frame = 0;

  return {
    setProgress(nextWorking, nextFrame) {
      working = nextWorking;
      frame = nextFrame;
    },
    isWorking: () => working,
    currentFrame: () => frame,
    completion(messageNumber) {
      const completedAt = completions.get(messageNumber);
      return completedAt === undefined ? { state: "absent" } : { state: "present", value: completedAt };
    },
    setCompletion(messageNumber, completedAt) {
      completions.set(messageNumber, completedAt);
    },
    clearCompletions() {
      completions.clear();
    },
  };
}
