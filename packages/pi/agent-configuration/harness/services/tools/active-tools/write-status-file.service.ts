import { writeFile } from "node:fs/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { HARNESS_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";

export async function writeStatusFile(pi: ExtensionAPI): Promise<void> {
  const target = process.env.PI_HARNESS_STATUS_FILE;
  if (!target) return;
  const statusPayload = {
    active: pi.getActiveTools(),
    all: pi.getAllTools().map((tool) => tool.name),
    harness: [...HARNESS_TOOLS],
  };
  try {
    await writeFile(target, JSON.stringify(statusPayload, null, 2), "utf8");
  } catch {
    return;
  }
}
