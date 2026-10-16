import type { ActivityFinishPatch } from "../../../types/activity/activity-finish-patch.interface.ts";
import type { ActivityListener } from "../../../types/activity/activity-listener.interface.ts";
import type { ActivityStore } from "../../../types/activity/activity-store.interface.ts";
import type { ActivityUpdatePatch } from "../../../types/activity/activity-update-patch.interface.ts";
import type { AgentActivity } from "../../../types/activity/agent-activity.interface.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { ToolResultFields } from "../../../types/activity/tool-result-fields.interface.ts";
import { findArtifactPath } from "../artifact/find-artifact-path.service.ts";

function createIdleAgentActivity(): AgentActivity {
  return { phase: "idle", thinking: "", thinkingRedacted: false, response: "", updatedAt: Date.now() };
}

function withResultFields(entry: ToolActivity, fields: ToolResultFields): ToolActivity {
  return {
    ...entry,
    details: fields.details.state === "present" ? fields.details : entry.details,
    sub: fields.sub,
    usage: fields.usage.usageState === "reported" ? fields.usage : entry.usage,
    model: fields.model.state === "present" ? fields.model : entry.model,
    thinkingLevel: fields.thinkingLevel.state === "present" ? fields.thinkingLevel : entry.thinkingLevel,
  };
}

export function createActivityStore(): ActivityStore {
  const activities = new Map<string, ToolActivity>();
  const listeners = new Set<ActivityListener>();
  let agent = createIdleAgentActivity();

  const emit = (): void => {
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        // A broken listener must not break recording.
      }
    }
  };
  const replace = (entry: ToolActivity): void => {
    activities.set(entry.id, entry);
    emit();
  };

  return {
    clear() {
      activities.clear();
      agent = createIdleAgentActivity();
      emit();
    },
    setPhase(phase) {
      agent = { ...agent, phase, updatedAt: Date.now() };
      emit();
    },
    setAssistantText(patch) {
      agent = {
        ...agent,
        thinking: patch.thinking,
        thinkingRedacted: patch.thinkingRedacted,
        response: patch.response,
        updatedAt: patch.updatedAt,
      };
      emit();
    },
    currentAgent() {
      return agent;
    },
    begin(input) {
      const existing = activities.get(input.id);
      if (existing !== undefined) return existing;
      const entry: ToolActivity = {
        id: input.id,
        toolName: input.toolName,
        args: input.args,
        status: "running",
        usage: { usageState: "unreported" },
        model: { state: "absent" },
        thinkingLevel: { state: "absent" },
        text: "",
        details: { state: "absent" },
        cwd: input.cwd,
        startedAt: input.startedAt,
        endedAt: { state: "absent" },
        artifactPath: { found: false },
        sub: [],
      };
      replace(entry);
      return entry;
    },
    update(id, patch: ActivityUpdatePatch) {
      const entry = activities.get(id);
      if (entry === undefined) return;
      replace({
        ...withResultFields(entry, patch),
        text: patch.text,
        status: patch.status.state === "present" ? patch.status.value : entry.status,
      });
    },
    finish(id, patch: ActivityFinishPatch) {
      const entry = activities.get(id);
      if (entry === undefined) return;
      replace({
        ...withResultFields(entry, patch),
        text: patch.text,
        status: patch.status,
        endedAt: { state: "present", value: patch.endedAt },
        artifactPath: findArtifactPath(patch.text),
      });
    },
    lookup(id) {
      const entry = activities.get(id);
      return entry === undefined ? { found: false } : { found: true, entry };
    },
    all() {
      return [...activities.values()];
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
