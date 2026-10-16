let agentWorking = false;
let workingOverride: boolean | undefined;
let idleOverride: boolean | undefined;
const transcriptVisibilityKey = "pi.harness.toolHistoryVisible";

function syncTranscriptVisibility(): void {
  Reflect.set(globalThis, transcriptVisibilityKey, isActivityVisible());
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
