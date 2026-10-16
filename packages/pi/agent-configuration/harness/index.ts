import { writeFile } from "node:fs/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "./constants/subagents/roles.constant.ts";
import { HARNESS_TOOLS, WEB_TOOLS } from "./constants/tools/harness-tools.constant.ts";
import { DEFAULT_RUN_TIMEOUT_MS } from "./constants/tools/run-limits.constant.ts";
import { DEFAULT_SEARCH_LIMIT } from "./constants/tools/search-limits.constant.ts";
import {
  EDIT_TOOL_DESCRIPTION,
  READ_TOOL_DESCRIPTION,
  RUN_TOOL_DESCRIPTION,
  SEARCH_TOOL_DESCRIPTION,
} from "./constants/tools/tool-descriptions.constant.ts";
import { EditParamsSchema } from "./schemas/tools/edit/edit-parameters.schema.ts";
import { ReadParamsSchema } from "./schemas/tools/read/read-parameters.schema.ts";
import { RunParamsSchema } from "./schemas/tools/run/run-parameters.schema.ts";
import { SearchParamsSchema } from "./schemas/tools/search/search-parameters.schema.ts";
import { installSessions } from "./services/sessions/install/install-sessions.service.ts";
import { toToolCancellation } from "./services/tools/process/tool-cancellation.service.ts";
import { registerSubagentTool } from "./subagents/tool.ts";
import { editFile, toEditRequest } from "./tools/edit.ts";
import { readSource, toReadSelection } from "./tools/read.ts";
import { runShell } from "./tools/run.ts";
import { searchRepo } from "./tools/search.ts";
import { installHarnessPresentation } from "./ui/install.ts";
import { createHarnessRenderers } from "./ui/tool-renderer.ts";

const ALLOWED_TOOL_SET = new Set<string>([...HARNESS_TOOLS, TASK_TOOL_NAME, ...WEB_TOOLS]);

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
    parameters: SearchParamsSchema,
    ...createHarnessRenderers("search"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await searchRepo({
        cwd: ctx.cwd,
        query: params.query,
        kind: params.kind ?? "auto",
        scope: params.path ? { kind: "path", path: params.path } : { kind: "workspace" },
        limit: params.limit ?? DEFAULT_SEARCH_LIMIT,
        cancellation: toToolCancellation(signal),
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
    parameters: ReadParamsSchema,
    ...createHarnessRenderers("read"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const text = await readSource({
        cwd: ctx.cwd,
        path: params.path,
        selection: toReadSelection(params),
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "edit",
    label: "Edit",
    description: EDIT_TOOL_DESCRIPTION,
    promptSnippet: "Apply precise file edits and report a compact diff",
    promptGuidelines: ["Use edit for code changes; prefer exact-text replacements over rewriting whole files."],
    parameters: EditParamsSchema,
    ...createHarnessRenderers("edit"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const validation = toEditRequest(ctx.cwd, params);
      if (!validation.valid) {
        return { content: [{ type: "text", text: validation.summary }], details: {} };
      }
      const result = await editFile(validation.request);
      return { content: [{ type: "text", text: result.summary }], details: {} };
    },
  });

  pi.registerTool({
    name: "run",
    label: "Run",
    description: RUN_TOOL_DESCRIPTION,
    promptSnippet: "Run shell commands not covered by search, read, or edit",
    promptGuidelines: ["Use run only when search, read, or edit does not cover the operation."],
    parameters: RunParamsSchema,
    ...createHarnessRenderers("run"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await runShell({
        cwd: ctx.cwd,
        command: params.command,
        timeoutMs: params.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
        cancellation: toToolCancellation(signal),
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
