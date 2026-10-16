import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { InspectRequestStore } from "../../../types/inspector/request/inspect-request-store.interface.ts";
import type { InspectorOpener } from "../../../types/inspector/request/inspector-opener.interface.ts";

export function createInspectRequestStore(): InspectRequestStore {
  let currentContext: ExtensionContext | undefined;
  let openInspector: InspectorOpener | undefined;

  return {
    setContext(ctx) {
      currentContext = ctx;
    },
    setOpener(opener) {
      openInspector = opener;
    },
    requestInspection(toolCallId) {
      if (!currentContext || !openInspector) return;
      openInspector(currentContext, { kind: "tool-call", toolCallId });
    },
  };
}
