import { writeFile } from "node:fs/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { HARNESS_TOOLS, type HarnessTool } from "./tools/config.ts";
import { editFile } from "./tools/edit.ts";
import { readSource } from "./tools/read.ts";
import { runShell } from "./tools/run.ts";
import { searchRepo } from "./tools/search.ts";
import { EditParams, ReadParams, RunParams, SearchParams } from "./tools/parameters.ts";
import { installHarnessPresentation } from "./ui/install.ts";
import { createHarnessRenderers } from "./ui/tool-renderer.ts";
import { registerSubagentTool } from "./subagents/tool.ts";
import { TASK_TOOL_NAME } from "./subagents/roles.ts";
import { installSessions } from "./sessions/install.ts";

const SEARCH_TOOL_DESCRIPTION = [
  "Find filenames, text, symbols, definitions, references, tests, structural matches, or git history.",
  "Returns a small, classified result with omitted counts.",
].join(" ");
const READ_TOOL_DESCRIPTION = [
  "Read a bounded slice of a source file by path, line range, or symbol.",
  "Large broad reads return structure and symbols instead of the whole file.",
].join(" ");
const EDIT_TOOL_DESCRIPTION = [
  "Modify files with precise patches.",
  "Supports exact replacements, file creation, deletion, and moves.",
  "Returns a compact name and diff summary instead of the whole file.",
].join(" ");
const RUN_TOOL_DESCRIPTION = [
  "Run a shell command when no specialized tool covers the operation.",
  "Captures exit code, compresses large output, and stores the full output under .agent/runs.",
].join(" ");

const WEB_TOOLS = [
  "web_search",
  "fetch_content",
  "get_search_content",
  "source_check",
] as const;
const ALLOWED_TOOL_SET = new Set<string>([
  ...HARNESS_TOOLS,
  TASK_TOOL_NAME,
  ...WEB_TOOLS,
]);

function enforceActiveTools(pi: ExtensionAPI): void {
  const registered = new Set(pi.getAllTools().map((tool) => tool.name));
  const activeWebTools = WEB_TOOLS.filter((tool) => registered.has(tool));
  pi.setActiveTools([...HARNESS_TOOLS, TASK_TOOL_NAME, ...activeWebTools]);
}

async function writeStatusFile(pi: ExtensionAPI): Promise<void> {
  const target = process.env.PI_HARNESS_STATUS_FILE;
  if (!target) return;
  const payload = {
    active: pi.getActiveTools(),
    all: pi.getAllTools().map((tool) => tool.name),
    harness: [...HARNESS_TOOLS],
  };
  try {
    await writeFile(target, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    return;
  }
}

export default function harnessExtension(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "search",
    label: "Search",
    description: SEARCH_TOOL_DESCRIPTION,
    promptSnippet: "Locate files, symbols, references, and tests with bounded output",
    promptGuidelines: [
      "Use search to locate relevant files, symbols, references, and tests before reading or editing.",
    ],
    parameters: SearchParams,
    ...createHarnessRenderers("search"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await searchRepo({
        cwd: ctx.cwd,
        query: params.query,
        kind: params.kind,
        path: params.path,
        limit: params.limit,
        signal,
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "read",
    label: "Read",
    description: READ_TOOL_DESCRIPTION,
    promptSnippet: "Read only the source needed for the current problem",
    promptGuidelines: [
      "Use read for the source required to understand the problem; it bounds large files automatically.",
    ],
    parameters: ReadParams,
    ...createHarnessRenderers("read"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const text = await readSource({
        cwd: ctx.cwd,
        path: params.path,
        offset: params.offset,
        limit: params.limit,
        symbol: params.symbol,
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "edit",
    label: "Edit",
    description: EDIT_TOOL_DESCRIPTION,
    promptSnippet: "Apply precise file edits and report a compact diff",
    promptGuidelines: [
      "Use edit for code changes; prefer exact-text replacements over rewriting whole files.",
    ],
    parameters: EditParams,
    ...createHarnessRenderers("edit"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const target = params.path ?? params.from;
      if (!target) {
        return {
          content: [{ type: "text", text: "edit failed: 'path' is required." }],
          details: {},
        };
      }
      const result = await editFile({
        cwd: ctx.cwd,
        op: params.op,
        path: target,
        oldText: params.oldText,
        newText: params.newText,
        edits: params.edits,
        replaceAll: params.replaceAll,
        content: params.content,
        overwrite: params.overwrite,
        from: params.from,
        to: params.to,
      });
      return { content: [{ type: "text", text: result.summary }], details: {} };
    },
  });

  pi.registerTool({
    name: "run",
    label: "Run",
    description: RUN_TOOL_DESCRIPTION,
    promptSnippet: "Run shell commands not covered by search, read, or edit",
    promptGuidelines: ["Use run only when search, read, or edit does not cover the operation."],
    parameters: RunParams,
    ...createHarnessRenderers("run"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await runShell({
        cwd: ctx.cwd,
        command: params.command,
        timeoutMs: params.timeoutMs,
        signal,
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  registerSubagentTool(pi);

  installHarnessPresentation(pi);
  installSessions(pi);

  pi.on("session_start", async () => {
    enforceActiveTools(pi);
    await writeStatusFile(pi);
  });

  pi.on("resources_discover", async () => {
    enforceActiveTools(pi);
  });

  pi.on("before_agent_start", async () => {
    enforceActiveTools(pi);
  });

  pi.on("turn_start", async () => {
    enforceActiveTools(pi);
  });

  pi.on("tool_call", async (event) => {
    if (!ALLOWED_TOOL_SET.has(event.toolName)) {
      const reason = [
        `Tool "${event.toolName}" is not enabled in this session.`,
        "Use the harness tools or the approved local web research tools.",
      ].join(" ");
      return {
        block: true,
        reason,
      };
    }
  });

  pi.registerCommand("harness-status", {
    description: "Show the active harness tools",
    handler: async (_args, ctx) => {
      enforceActiveTools(pi);
      await writeStatusFile(pi);
      const active = pi.getActiveTools();
      const all = pi.getAllTools().map((tool) => tool.name);
      ctx.ui.notify(
        `active: ${active.join(", ")}\nregistered: ${all.join(", ")}\nharness: ${HARNESS_TOOLS.join(", ")}`,
        "info",
      );
    },
  });
}

export type { HarnessTool };
