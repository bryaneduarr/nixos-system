import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { type ActivityStatus, activityStore, type SubToolActivity, type ToolActivity } from "../../activity/store.ts";
import { resolveTaskRole, TASK_TOOL_NAME } from "../../subagents/roles.ts";
import { isHarnessTool } from "../../tools/config.ts";
import { renderBox } from "../formatting.ts";
import { toolColor, toolLabel, toolTarget } from "../tool-renderer.ts";
import { formatTokens, modelLabel } from "./usage.ts";

const TASK_DEFAULT_TOOLS = "search, read, run";

export interface InspectorRow {
  entry: ToolActivity;
  sub?: SubToolActivity;
}

export interface DetailLine {
  text: string;
  color?: ThemeColor;
  bold?: boolean;
}

interface DetailOptions {
  row: InspectorRow;
  width: number;
  artifactText?: string;
}

function statusColor(status: ActivityStatus): ThemeColor {
  switch (status) {
    case "running":
      return "warning";
    case "error":
      return "error";
    default:
      return "success";
  }
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return value.replace(/\r?\n/g, "\n    ");
  if (value === undefined) return "";

  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function formatOutput(text: string): string {
  if (!text) return "(empty)";

  try {
    const parsed: unknown = JSON.parse(text);
    return JSON.stringify(parsed, null, 2) ?? text;
  } catch {
    return text;
  }
}

function stringValues(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.filter((item): item is string => typeof item === "string");
}

function formatMissionInput(args: Record<string, unknown>): string {
  const selectedTools = stringValues(args.tools);
  const verificationCommands = stringValues(args.verificationCommands);
  let roleAndTools: string[];

  try {
    const resolved = resolveTaskRole({
      role: args.role,
      tools: selectedTools,
      verificationCommands,
    });
    const effectiveTools = resolved.tools.join(", ") || "none";
    roleAndTools = [`role: ${resolved.role}`, `effective tools: ${effectiveTools}`];
  } catch {
    const role = typeof args.role === "string" ? args.role : TASK_TOOL_NAME;
    const tools = selectedTools?.join(", ") ?? "invalid";
    roleAndTools = [`role: ${role}`, `tools: ${tools}`];
  }

  const lines = [`title: ${String(args.title ?? "")}`, ...roleAndTools, `mission: ${args.mission}`];

  if (typeof args.context === "string") {
    lines.push(`context: ${args.context}`);
  }

  if (verificationCommands?.length) {
    lines.push(`approved commands: ${verificationCommands.join("; ")}`);
  }

  const skills = Array.isArray(args.skills) ? args.skills.join(", ") : "none";
  lines.push(`skills: ${skills}`);

  if (typeof args.model === "string") lines.push(`model: ${args.model}`);
  if (typeof args.reasoning === "string") lines.push(`reasoning: ${args.reasoning}`);
  if (typeof args.timeoutMs === "number") lines.push(`timeout: ${args.timeoutMs} ms`);

  return lines.join("\n");
}

function formatLegacyTaskInput(args: Record<string, unknown>): string {
  const prompt = typeof args.prompt === "string" ? args.prompt : "(empty)";
  const selectedTools = stringValues(args.tools) ?? [];
  const cwd = typeof args.cwd === "string" ? args.cwd : "";
  const toolList = selectedTools.length > 0 ? selectedTools.join(", ") : TASK_DEFAULT_TOOLS;
  const lines = ["instruction:", prompt, "", `tools: ${toolList}`];

  if (cwd) lines.push(`cwd: ${cwd}`);

  return lines.join("\n");
}

function formatInput(tool: string, args: Record<string, unknown>): string {
  if (tool !== TASK_TOOL_NAME) return formatValue(args);
  if (typeof args.mission === "string") return formatMissionInput(args);

  return formatLegacyTaskInput(args);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  const precision = ms < 10_000 ? 1 : 0;
  return `${seconds.toFixed(precision)}s`;
}

function boxDetails(title: string, text: string, color: ThemeColor, width: number): DetailLine[] {
  const wrappedLines = text.split(/\r?\n/);
  return renderBox(title, wrappedLines, width).map((line) => ({ text: line, color }));
}

export function buildDetail({ row, width, artifactText }: DetailOptions): DetailLine[] {
  const entry = row.entry;
  const sub = row.sub;
  const tool = sub?.toolName ?? entry.toolName;
  const args = sub?.args ?? entry.args;
  const status = sub?.status ?? entry.status;
  const startedAt = sub?.startedAt ?? entry.startedAt;
  const endedAt = sub?.endedAt ?? entry.endedAt;
  const rawText = artifactText ?? sub?.text ?? entry.text;
  const output = formatOutput(rawText);
  const lines: DetailLine[] = [];
  const color = isHarnessTool(tool)
    ? toolColor(tool)
    : tool === "message" || tool === "thinking" || tool === "update"
      ? "accent"
      : "muted";
  const elapsed = formatDuration(Math.max(0, (endedAt ?? Date.now()) - startedAt));
  const runningLabel = endedAt === undefined ? " · running" : "";
  const timing = `${formatTime(startedAt)} · ${elapsed}${runningLabel}`;
  const heading =
    tool === "message"
      ? `USER MESSAGE ${String(args.number ?? "")} · ${formatTime(startedAt)}`
      : `${toolLabel(tool)} · ${status.toUpperCase()} · ${formatTime(startedAt)}`;

  lines.push({
    text: heading,
    color: tool === "message" ? "accent" : statusColor(status),
    bold: true,
  });

  if (tool !== TASK_TOOL_NAME || sub) {
    const target = isHarnessTool(tool) ? toolTarget(tool, args) : tool;
    lines.push({ text: target, color, bold: true });
  }

  lines.push({ text: "" });

  if (tool === "message") {
    const entries = activityStore.all();
    const index = entries.indexOf(entry);
    const following = entries.slice(index + 1);
    const nextMessage = following.findIndex((item) => item.toolName === "message");
    const group = nextMessage < 0 ? following : following.slice(0, nextMessage);
    const calls = group.filter((item) => isHarnessTool(item.toolName)).length;
    const callLabel = `${calls} tool call${calls === 1 ? "" : "s"}`;

    lines.push({
      text: `${callLabel} after this message · ${formatTime(startedAt)}`,
      color: "accent",
    });
    lines.push({ text: "" });
    lines.push(...boxDetails("user message", rawText || "(no text)", "accent", width));
    return lines;
  }

  if (tool === "update") {
    lines.push({ text: `AGENT UPDATE  ${timing}`, color: "accent", bold: true });
    lines.push({ text: "" });
    lines.push(...boxDetails("update", rawText, "accent", width));
    return lines;
  }

  if (tool === "thinking") {
    lines.push({ text: `THINKING  ${timing}`, color: "accent", bold: true });
    lines.push({ text: "" });
    lines.push(...boxDetails("thinking", rawText || "(redacted)", "accent", width));
    return lines;
  }

  if (!sub && tool === TASK_TOOL_NAME) {
    const usage = entry.usage;
    const modelWindow = entry.model?.contextWindow;
    const reasoning = entry.thinkingLevel ?? "—";
    const currentContext = usage?.contextTokens === undefined ? "—" : formatTokens(usage.contextTokens);
    const contextWindow = modelWindow ? formatTokens(modelWindow) : "—";
    const callCount = entry.sub.length;

    lines.push({ text: `MODEL ${modelLabel(entry.model)}`, color: "accent", bold: true });
    lines.push({ text: `REASONING ${reasoning}`, color: "accent" });
    lines.push({
      text: `CONTEXT ${currentContext}/${contextWindow} | ${callCount} calls`,
      color: "accent",
      bold: true,
    });
    lines.push({ text: "" });
  }

  lines.push({ text: `INPUT  ${timing}`, color, bold: true });
  lines.push({ text: "" });
  lines.push(...boxDetails("input", formatInput(tool, args), color, width));
  lines.push({ text: "" });

  if (entry.artifactPath) {
    const artifactAction = artifactText ? "· open" : "· press a";
    lines.push({
      text: `artifact ${artifactAction} · ${entry.artifactPath}`,
      color: "muted",
    });
    lines.push({ text: "" });
  }

  const outputTitle = artifactText ? "ARTIFACT" : "OUTPUT";
  const outputBoxTitle = artifactText ? "json" : "result";
  lines.push({ text: outputTitle, color, bold: true });
  lines.push({ text: "" });
  lines.push(...boxDetails(outputBoxTitle, output, color, width));
  return lines;
}
