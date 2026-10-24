import { describe, expect, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createRecordingExtensionApi } from "./extension-registrations.test-double.ts";
import clearSessionExtension from "./extensions/clear-session.extension.ts";
import codexFastModeExtension from "./extensions/codex-fast-mode/codex-fast-mode.extension.ts";
import lastModelExtension from "./extensions/last-model/last-model.extension.ts";
import quietToolOutputExtension from "./extensions/quiet-tool-output.extension.ts";
import harnessExtension from "./harness/harness.extension.ts";

const HARNESS_REGISTRATIONS = [
  "tool:search",
  "tool:read",
  "tool:edit",
  "tool:run",
  "tool:task",
  "command:subagent-status",
  "command:subagent-cancel",
  "event:session_start",
  "event:session_shutdown",
  "entry-renderer:harness-activity-summary",
  "event:message_start",
  "event:message_update",
  "event:message_end",
  "event:tool_execution_start",
  "event:tool_execution_update",
  "event:tool_execution_end",
  "shortcut:alt+i",
  "command:activity",
  "event:session_start",
  "event:agent_start",
  "event:agent_settled",
  "shortcut:alt+v",
  "event:session_shutdown",
  "event:session_start",
  "event:agent_start",
  "shortcut:ctrl+alt+u",
  "shortcut:alt+t",
  "command:prompts",
  "event:session_start",
  "event:input",
  "event:session_shutdown",
  "shortcut:alt+h",
  "markdown-transformer:transformer",
  "event:session_start",
  "event:session_shutdown",
  "event:session_start",
  "event:session_shutdown",
  "event:session_start",
  "event:session_shutdown",
  "event:session_start",
  "event:session_shutdown",
  "tool-renderer:resolver",
  "event:session_shutdown",
  "command:exit",
  "shortcut:ctrl+alt+q",
  "event:session_start",
  "event:session_shutdown",
  "event:before_agent_start",
  "event:message_start",
  "event:user_bash",
  "event:agent_start",
  "event:agent_settled",
  "event:session_before_compact",
  "event:session_compact",
  "event:session_compact_failed",
  "shortcut:ctrl+alt+s",
  "command:sessions",
  "shortcut:ctrl+alt+n",
  "event:session_start",
  "event:resources_discover",
  "event:before_agent_start",
  "event:turn_start",
  "event:tool_call",
  "command:harness-status",
  "command:session-stats",
];

const CODEX_FAST_MODE_REGISTRATIONS = [
  "provider:harness-codex-fast",
  "event:session_start",
  "event:session_tree",
  "event:model_select",
  "shortcut:ctrl+alt+f",
  "command:fast",
];

const LAST_MODEL_REGISTRATIONS = [
  "event:session_before_switch",
  "event:session_start",
  "event:model_select",
  "event:thinking_level_select",
  "event:agent_end",
];

function registrationsOf(extension: (api: ExtensionAPI) => void): readonly string[] {
  const recording = createRecordingExtensionApi();
  extension(recording.api);
  return recording.registrations;
}

describe("extension entry points register their features in order", () => {
  test("the harness registers its tools, commands, shortcuts, and events", () => {
    expect(registrationsOf(harnessExtension)).toEqual(HARNESS_REGISTRATIONS);
  });

  test("codex fast mode registers its provider, events, shortcut, and command", () => {
    expect(registrationsOf(codexFastModeExtension)).toEqual(CODEX_FAST_MODE_REGISTRATIONS);
  });

  test("last model registers its session and model events", () => {
    expect(registrationsOf(lastModelExtension)).toEqual(LAST_MODEL_REGISTRATIONS);
  });

  test("clear session registers the clear command", () => {
    expect(registrationsOf(clearSessionExtension)).toEqual(["command:clear"]);
  });

  test("quiet tool output registers its tool result event", () => {
    expect(registrationsOf(quietToolOutputExtension)).toEqual(["event:tool_result"]);
  });
});
