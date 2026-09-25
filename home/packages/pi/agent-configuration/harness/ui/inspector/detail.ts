import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { activityStore, type ActivityStatus, type SubToolActivity, type ToolActivity } from "../../activity/store.ts";
import { isHarnessTool } from "../../tools/config.ts";
import { renderBox } from "../formatting.ts";
import { toolColor, toolLabel, toolTarget } from "../tool-renderer.ts";
import { contextUsageLabel, formatTokens, modelLabel } from "./usage.ts";

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
  taskExpanded: boolean;
}

function statusColor(status: ActivityStatus): ThemeColor {
  switch (status) {
    case "running": return "warning";
    case "error": return "error";
    default: return "success";
  }
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return value.replace(/\r?\n/g, "\n    ");
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
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

function formatInput(tool: string, args: Record<string, unknown>): string {
  if (tool !== "task") return formatValue(args);

  const prompt = typeof args.prompt === "string" ? args.prompt : "(empty)";
  const tools = Array.isArray(args.tools)
    ? args.tools.filter((value): value is string => typeof value === "string")
    : [];
  const cwd = typeof args.cwd === "string" ? args.cwd : "";
  return [
    "instruction:", prompt, "",
    `tools: ${tools.length > 0 ? tools.join(", ") : "search, read, run"}`,
    ...(cwd ? [`cwd: ${cwd}`] : []),
  ].join("\n");
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
}

function boxDetails(title: string, text: string, color: ThemeColor, width: number): DetailLine[] {
  return renderBox(title, text.split(/\r?\n/), width).map((line) => ({ text: line, color }));
}

export function buildDetail({ row, width, artifactText, taskExpanded }: DetailOptions): DetailLine[] {
  const entry = row.entry;
  const sub = row.sub;
  const tool = sub?.toolName ?? entry.toolName;
  const args = sub?.args ?? entry.args;
  const status = sub?.status ?? entry.status;
  const startedAt = sub?.startedAt ?? entry.startedAt;
  const endedAt = sub?.endedAt ?? entry.endedAt;
  const rawText = artifactText ?? sub?.text ?? entry.text;
  const text = formatOutput(rawText);
  const lines: DetailLine[] = [];
  const color = isHarnessTool(tool)
    ? toolColor(tool)
    : tool === "message" || tool === "thinking" || tool === "update"
      ? "accent" : "muted";
  const timing = `${formatTime(startedAt)} · ${formatDuration(Math.max(0, (endedAt ?? Date.now()) - startedAt))}${endedAt === undefined ? " · running" : ""}`;

  lines.push({
    text: tool === "message"
      ? `USER MESSAGE ${String(args.number ?? "")} · ${formatTime(startedAt)}`
      : `${toolLabel(tool)} · ${status.toUpperCase()} · ${formatTime(startedAt)}`,
    color: tool === "message" ? "accent" : statusColor(status),
    bold: true,
  });
  lines.push({ text: isHarnessTool(tool) ? toolTarget(tool, args) : tool, color, bold: true });
  lines.push({ text: "" });

  if (tool === "message") {
    const entries = activityStore.all();
    const index = entries.indexOf(entry);
    const following = entries.slice(index + 1);
    const next = following.findIndex((item) => item.toolName === "message");
    const group = next < 0 ? following : following.slice(0, next);
    const calls = group.filter((item) => isHarnessTool(item.toolName)).length;
    lines.push({
      text: `${calls} tool call${calls === 1 ? "" : "s"} after this message · ${formatTime(startedAt)}`,
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

  if (!sub && tool === "task") {
    const usage = entry.usage;
    const modelWindow = entry.model?.contextWindow;
    const reasoning = entry.thinkingLevel ?? "—";
    const capability = entry.model?.reasoning === undefined
      ? ""
      : entry.model.reasoning ? " · supported" : " · unsupported";
    lines.push({ text: `MODEL ${modelLabel(entry.model)}`, color: "accent", bold: true });
    lines.push({
      text: `WINDOW ${modelWindow ? `${formatTokens(modelWindow)} tokens` : "—"}`,
      color: "accent",
    });
    lines.push({ text: `REASONING ${reasoning}${capability}`, color: "accent" });
    lines.push({
      text: `CONTEXT ${contextUsageLabel(usage, entry.model)} · spent ${usage ? formatTokens(usage.totalTokens) : "—"} · ${entry.sub.length} calls · ${taskExpanded ? "← collapse" : "→ open"}`,
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
    lines.push({
      text: `artifact ${artifactText ? "· open" : "· press a"} · ${entry.artifactPath}`,
      color: "muted",
    });
    lines.push({ text: "" });
  }

  lines.push({ text: artifactText ? "ARTIFACT" : "OUTPUT", color, bold: true });
  lines.push({ text: "" });
  lines.push(...boxDetails(artifactText ? "json" : "result", text, color, width));
  return lines;
}
