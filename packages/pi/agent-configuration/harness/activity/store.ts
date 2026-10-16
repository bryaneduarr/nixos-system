export type ActivityStatus = "running" | "success" | "error";
export type AgentActivityPhase = "idle" | "thinking" | "working" | "responding";

export interface SubagentModel {
  provider: string;
  id: string;
  name?: string;
  reasoning?: boolean;
  contextWindow?: number;
}

export interface SubagentMetadata {
  model?: SubagentModel;
  thinkingLevel?: string;
}

export interface SubagentUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
  /** Cumulative tokens spent across completed responses. */
  totalTokens: number;
  /** Token usage reported for the latest response/context. */
  contextTokens?: number;
  /** Largest context usage observed in any response. */
  maxContextTokens?: number;
}

export interface AgentActivity {
  phase: AgentActivityPhase;
  thinking: string;
  thinkingRedacted: boolean;
  response: string;
  updatedAt: number;
}

export interface AssistantActivitySnapshot {
  thinking: string;
  thinkingRedacted: boolean;
  response: string;
  hasToolCall: boolean;
}

/** A single tool call executed by a delegated worker (sub-agent). */
export interface SubToolActivity {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  status: ActivityStatus;
  /** Bounded, model-visible result text for this tool call. */
  text: string;
  startedAt: number;
  endedAt?: number;
}

/** A single tool call executed by the primary agent. */
export interface ToolActivity {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  status: ActivityStatus;
  /** Provider-reported usage for a delegated worker. */
  usage?: SubagentUsage;
  /** Model metadata captured for a delegated worker. */
  model?: SubagentModel;
  /** Effective thinking/reasoning level used by a delegated worker. */
  thinkingLevel?: string;
  /** Full, model-visible result text for this tool call. */
  text: string;
  details?: unknown;
  cwd: string;
  startedAt: number;
  endedAt?: number;
  /** Path (relative to cwd) of a saved full-output artifact, when present. */
  artifactPath?: string;
  /** Nested worker tool calls, only present for the `task` tool. */
  sub: SubToolActivity[];
}

const ARTIFACT_PATTERNS = [/^\s*Full output:\s*(\S+)\s*$/m, /^\s*artifact:\s*(\S+)\s*$/m];

/** Extracts a referenced full-output artifact path from tool result text. */
export function findArtifactPath(text: string): string | undefined {
  for (const pattern of ARTIFACT_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

type Listener = () => void;

export class ActivityStore {
  private entries: ToolActivity[] = [];
  private byId = new Map<string, ToolActivity>();
  private listeners = new Set<Listener>();
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

  updateAgent(patch: Partial<Omit<AgentActivity, "updatedAt">> & { updatedAt?: number }): void {
    this.agent = {
      ...this.agent,
      ...patch,
      updatedAt: patch.updatedAt ?? Date.now(),
    };
    this.emit();
  }

  currentAgent(): AgentActivity {
    return this.agent;
  }

  begin(input: {
    id: string;
    toolName: string;
    args: Record<string, unknown>;
    cwd: string;
    startedAt?: number;
  }): ToolActivity {
    const existing = this.byId.get(input.id);
    if (existing) return existing;
    const entry: ToolActivity = {
      id: input.id,
      toolName: input.toolName,
      args: input.args,
      status: "running",
      text: "",
      cwd: input.cwd,
      startedAt: input.startedAt ?? Date.now(),
      sub: [],
    };
    this.entries.push(entry);
    this.byId.set(input.id, entry);
    this.emit();
    return entry;
  }

  update(
    id: string,
    patch: Partial<Pick<ToolActivity, "text" | "details" | "sub" | "status" | "usage" | "model" | "thinkingLevel">>,
  ): void {
    const entry = this.byId.get(id);
    if (!entry) return;
    if (patch.text !== undefined) entry.text = patch.text;
    if (patch.details !== undefined) entry.details = patch.details;
    if (patch.sub !== undefined) entry.sub = patch.sub;
    if (patch.status !== undefined) entry.status = patch.status;
    if (patch.usage !== undefined) entry.usage = patch.usage;
    if (patch.model !== undefined) entry.model = patch.model;
    if (patch.thinkingLevel !== undefined) {
      entry.thinkingLevel = patch.thinkingLevel;
    }
    this.emit();
  }

  finish(
    id: string,
    patch: {
      text: string;
      details?: unknown;
      sub?: SubToolActivity[];
      usage?: SubagentUsage;
      model?: SubagentModel;
      thinkingLevel?: string;
      status: ActivityStatus;
      endedAt?: number;
    },
  ): void {
    const entry = this.byId.get(id);
    if (!entry) return;
    entry.text = patch.text;
    if (patch.details !== undefined) entry.details = patch.details;
    if (patch.sub !== undefined) entry.sub = patch.sub;
    if (patch.usage !== undefined) entry.usage = patch.usage;
    if (patch.model !== undefined) entry.model = patch.model;
    if (patch.thinkingLevel !== undefined) {
      entry.thinkingLevel = patch.thinkingLevel;
    }
    entry.status = patch.status;
    entry.endedAt = patch.endedAt ?? Date.now();
    entry.artifactPath = findArtifactPath(entry.text);
    this.emit();
  }

  get(id: string): ToolActivity | undefined {
    return this.byId.get(id);
  }

  all(): readonly ToolActivity[] {
    return this.entries;
  }

  subscribe(listener: Listener): () => void {
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
