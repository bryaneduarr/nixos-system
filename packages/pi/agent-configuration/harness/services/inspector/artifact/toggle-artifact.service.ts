import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { DEFAULT_ARTIFACT } from "../../../constants/inspector/detail/default-artifact.constant.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";

export async function toggleArtifact(navigation: InspectorNavigation): Promise<string> {
  if (navigation.artifact.kind === "loaded") {
    navigation.artifact = DEFAULT_ARTIFACT;
    navigation.detailScroll = 0;
    return "showing tool result";
  }
  const lookup = navigation.currentRow();
  if (!lookup.found || !lookup.row.entry.artifactPath.found) return "no saved artifact for this call";

  const path = lookup.row.entry.artifactPath.path;
  try {
    const absolute = isAbsolute(path) ? path : resolve(lookup.row.entry.cwd, path);
    const content = await readFile(absolute, "utf8");
    navigation.artifact = { kind: "loaded", text: content };
    navigation.detailScroll = 0;
    return `loaded ${path} (${content.length} chars)`;
  } catch {
    return `could not read ${path}`;
  }
}
