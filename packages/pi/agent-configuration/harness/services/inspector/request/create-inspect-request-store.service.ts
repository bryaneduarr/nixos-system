import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { InspectRequestStore } from "../../../types/inspector/request/inspect-request-store.interface.ts";
import type { InspectorOpener } from "../../../types/inspector/request/inspector-opener.interface.ts";

export function createInspectRequestStore(): InspectRequestStore {
  let currentContext: ValueState<ExtensionContext> = { state: "absent" };
  let openInspector: ValueState<InspectorOpener> = { state: "absent" };

  return {
    setContext(ctx) {
      currentContext = { state: "present", value: ctx };
    },
    setOpener(opener) {
      openInspector = { state: "present", value: opener };
    },
    requestInspection(toolCallId) {
      if (currentContext.state === "absent" || openInspector.state === "absent") return;
      openInspector.value(currentContext.value, { kind: "tool-call", toolCallId });
    },
  };
}
