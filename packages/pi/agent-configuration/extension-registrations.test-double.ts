import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const UNAVAILABLE_IN_REGISTRATION_TESTS = "Not available while recording registrations.";

/** Extension API that records registrations, with the list it fills. */
export interface RecordingExtensionApi {
  /** API passed to an extension entry point. */
  readonly api: ExtensionAPI;
  /** Registrations in call order, written as `<kind>:<name>`. */
  readonly registrations: readonly string[];
}

function unavailable(): never {
  throw new Error(UNAVAILABLE_IN_REGISTRATION_TESTS);
}

export function createRecordingExtensionApi(): RecordingExtensionApi {
  const registrations: string[] = [];
  const record = (kind: string, name: string): void => {
    registrations.push(`${kind}:${name}`);
  };

  const api: ExtensionAPI = {
    registerTool: (tool) => record("tool", tool.name),
    registerCommand: (name) => record("command", name),
    registerShortcut: (shortcut) => record("shortcut", shortcut),
    registerFlag: (name) => record("flag", name),
    getFlag: () => false,
    registerMessageRenderer: (customType) => record("message-renderer", customType),
    registerMarkdownTransformer: () => record("markdown-transformer", "transformer"),
    registerEntryRenderer: (customType) => record("entry-renderer", customType),
    registerToolRenderer: () => record("tool-renderer", "resolver"),
    sendMessage: unavailable,
    sendUserMessage: unavailable,
    appendEntry: unavailable,
    setSessionName: unavailable,
    getSessionName: unavailable,
    setLabel: unavailable,
    exec: unavailable,
    getActiveTools: () => [],
    getAllTools: () => [],
    getSettings: unavailable,
    setActiveTools: unavailable,
    getCommands: () => [],
    setModel: unavailable,
    getThinkingLevel: unavailable,
    setThinkingLevel: unavailable,
    registerProvider: (provider: string | { readonly id: string }) =>
      record("provider", typeof provider === "string" ? provider : provider.id),
    unregisterProvider: unavailable,
    registerMcpServer: (name) => record("mcp-server", name),
    unregisterMcpServer: unavailable,
    getMcpServers: () => [],
    registerVirtualModel: unavailable,
    unregisterVirtualModel: unavailable,
    on: (event: string) => {
      record("event", event);
      return () => {};
    },
    events: { emit: unavailable, on: () => () => {} },
  };

  return { api, registrations };
}
