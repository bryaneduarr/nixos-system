import { TRANSCRIPT_VISIBILITY_KEY } from "../../constants/activity/visibility.constant.ts";

let agentWorking = false;
let workingOverride: boolean | undefined;
let idleOverride: boolean | undefined;

function syncTranscriptVisibility(): void {
  Reflect.set(globalThis, TRANSCRIPT_VISIBILITY_KEY, isActivityVisible());
}

export function resetActivityVisibility(): void {
  agentWorking = false;
  workingOverride = undefined;
  idleOverride = undefined;
  syncTranscriptVisibility();
}

export function setAgentWorking(working: boolean): void {
  agentWorking = working;
  syncTranscriptVisibility();
}

export function isActivityVisible(): boolean {
  const override = agentWorking ? workingOverride : idleOverride;
  return override ?? agentWorking;
}

export function toggleActivityVisibility(): boolean {
  const visible = !isActivityVisible();
  if (agentWorking) {
    workingOverride = visible;
  } else {
    idleOverride = visible;
  }
  syncTranscriptVisibility();
  return visible;
}

syncTranscriptVisibility();
