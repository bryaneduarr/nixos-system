import { TRANSCRIPT_VISIBILITY_KEY } from "../../../constants/activity/visibility/visibility.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { ActivityVisibility } from "../../../types/activity/visibility/activity-visibility.interface.ts";

export function createActivityVisibility(): ActivityVisibility {
  let agentWorking = false;
  let workingOverride: ValueState<boolean> = { state: "absent" };
  let idleOverride: ValueState<boolean> = { state: "absent" };

  const isVisible = (): boolean => {
    const override = agentWorking ? workingOverride : idleOverride;
    return override.state === "present" ? override.value : agentWorking;
  };
  const syncTranscriptVisibility = (): void => {
    Reflect.set(globalThis, TRANSCRIPT_VISIBILITY_KEY, isVisible());
  };

  syncTranscriptVisibility();

  return {
    reset() {
      agentWorking = false;
      workingOverride = { state: "absent" };
      idleOverride = { state: "absent" };
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
        workingOverride = { state: "present", value: visible };
      } else {
        idleOverride = { state: "present", value: visible };
      }
      syncTranscriptVisibility();
    },
  };
}
