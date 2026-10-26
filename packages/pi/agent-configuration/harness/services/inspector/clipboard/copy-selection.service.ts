import { copyToClipboard } from "@earendil-works/pi-coding-agent";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import { buildDetail } from "../detail/lines/build-detail.service.ts";

export async function copySelection(navigation: InspectorNavigation, width: number): Promise<string> {
  const lookup = navigation.currentRow();
  if (!lookup.found) return "nothing selected";

  const artifact = navigation.artifact;
  const text =
    artifact.kind === "loaded"
      ? artifact.text
      : buildDetail({ row: lookup.row, width, artifact })
          .map((line) => line.text)
          .join("\n");
  try {
    await copyToClipboard(text);
    return `copied ${text.length} chars`;
  } catch (error) {
    return `copy failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
