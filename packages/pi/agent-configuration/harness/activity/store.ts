import { ARTIFACT_PATTERNS } from "../constants/activity/artifact-pattern.constant.ts";
import type { ActivityBeginInput } from "../types/activity/activity-begin-input.interface.ts";
import type { ActivityFinishPatch } from "../types/activity/activity-finish-patch.interface.ts";
import type { ActivityListener } from "../types/activity/activity-listener.interface.ts";
import type { ActivityUpdatePatch } from "../types/activity/activity-update-patch.interface.ts";
import type { AgentActivity, AgentActivityPatch } from "../types/activity/agent-activity.interface.ts";
import type { ArtifactPathLookup } from "../types/activity/artifact-path.interface.ts";
import type { ToolActivity } from "../types/activity/tool-activity.interface.ts";

export function findArtifactPath(text: string): ArtifactPathLookup {
  for (const pattern of ARTIFACT_PATTERNS) {
    const path = pattern.exec(text)?.[1];
    if (path) return { found: true, path };
  }
  return { found: false };
}

export class ActivityStore {
  private entries: ToolActivity[] = [];
  private byId = new Map<string, ToolActivity>();
  private listeners = new Set<ActivityListener>();
  private agent: AgentActivity = {
    phase: "idle",
    thinking: "",
    thinkingRedacted: false,
    response: "",
    updatedAt: Date.now(),
  };

  clear(): void {
    this.entries = [];
    this.byId.clear();
    this.agent = {
      phase: "idle",
      thinking: "",
      thinkingRedacted: false,
      response: "",
      updatedAt: Date.now(),
    };
    this.emit();
  }

  updateAgent(patch: AgentActivityPatch): void {
    this.agent = {
      ...this.agent,
      ...patch,
      updatedAt: patch.updatedAt === undefined ? Date.now() : patch.updatedAt,
    };
    this.emit();
  }

  currentAgent(): AgentActivity {
    return this.agent;
  }

  begin(input: ActivityBeginInput): ToolActivity {
    const existing = this.byId.get(input.id);
    if (existing) return existing;
    const entry: ToolActivity = {
      id: input.id,
      toolName: input.toolName,
      args: input.args,
      status: "running",
      usage: { usageState: "unreported" },
      model: { state: "absent" },
      thinkingLevel: { state: "absent" },
      text: "",
      details: undefined,
      cwd: input.cwd,
      startedAt: input.startedAt === undefined ? Date.now() : input.startedAt,
      endedAt: { state: "absent" },
      artifactPath: { found: false },
      sub: [],
    };
    this.entries.push(entry);
    this.byId.set(input.id, entry);
    this.emit();
    return entry;
  }

  update(id: string, patch: ActivityUpdatePatch): void {
    const entry = this.byId.get(id);
    if (!entry) return;
    if (patch.text !== undefined) entry.text = patch.text;
    if (patch.details !== undefined) entry.details = patch.details;
    if (patch.sub !== undefined) entry.sub = patch.sub;
    if (patch.status !== undefined) entry.status = patch.status;
    if (patch.usage !== undefined && patch.usage.usageState === "reported") entry.usage = patch.usage;
    if (patch.model !== undefined && patch.model.state === "present") entry.model = patch.model;
    if (patch.thinkingLevel !== undefined && patch.thinkingLevel.state === "present") {
      entry.thinkingLevel = patch.thinkingLevel;
    }
    this.emit();
  }

  finish(id: string, patch: ActivityFinishPatch): void {
    const entry = this.byId.get(id);
    if (!entry) return;
    entry.text = patch.text;
    if (patch.details !== undefined) entry.details = patch.details;
    if (patch.sub !== undefined) entry.sub = patch.sub;
    if (patch.usage !== undefined && patch.usage.usageState === "reported") entry.usage = patch.usage;
    if (patch.model !== undefined && patch.model.state === "present") entry.model = patch.model;
    if (patch.thinkingLevel !== undefined && patch.thinkingLevel.state === "present") {
      entry.thinkingLevel = patch.thinkingLevel;
    }
    entry.status = patch.status;
    entry.endedAt = { state: "present", value: patch.endedAt === undefined ? Date.now() : patch.endedAt };
    entry.artifactPath = findArtifactPath(entry.text);
    this.emit();
  }

  get(id: string): ToolActivity | undefined {
    return this.byId.get(id);
  }

  all(): readonly ToolActivity[] {
    return this.entries;
  }

  subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // A broken listener must not break recording.
      }
    }
  }
}

export const activityStore = new ActivityStore();
