import { TRANSCRIPT_VISIBILITY_KEY } from "../../../constants/activity/visibility.constant.ts";
import type { ActivityVisibility } from "../../../types/activity/activity-visibility.interface.ts";

export function createActivityVisibility(): ActivityVisibility {
  let agentWorking = false;
  let workingOverride: boolean | undefined;
  let idleOverride: boolean | undefined;

  const isVisible = (): boolean => {
    const override = agentWorking ? workingOverride : idleOverride;
    return override ?? agentWorking;
  };
  const syncTranscriptVisibility = (): void => {
    Reflect.set(globalThis, TRANSCRIPT_VISIBILITY_KEY, isVisible());
  };

  syncTranscriptVisibility();

  return {
    reset() {
      agentWorking = false;
      workingOverride = undefined;
      idleOverride = undefined;
      syncTranscriptVisibility();
    },
    setAgentWorking(working) {
      agentWorking = working;
      syncTranscriptVisibility();
    },
    isVisible,
    toggle() {
      const visible = !isVisible();
      if (agentWorking) {
        workingOverride = visible;
      } else {
        idleOverride = visible;
      }
      syncTranscriptVisibility();
    },
  };
}
