import { HARNESS_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";

export function formatHarnessStatus(
  activeToolNames: readonly string[],
  registeredToolNames: readonly string[],
): string {
  return [
    `active: ${activeToolNames.join(", ")}`,
    `registered: ${registeredToolNames.join(", ")}`,
    `harness: ${HARNESS_TOOLS.join(", ")}`,
  ].join("\n");
}
