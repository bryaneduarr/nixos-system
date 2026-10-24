import { ARTIFACT_PATTERNS } from "../../../constants/activity/artifact/artifact-pattern.constant.ts";
import type { ArtifactPathLookup } from "../../../types/activity/artifact/artifact-path-lookup.interface.ts";

export function findArtifactPath(text: string): ArtifactPathLookup {
  for (const pattern of ARTIFACT_PATTERNS) {
    const match = pattern.exec(text);
    if (match === null) continue;
    const [, path] = match;
    if (path) return { found: true, path };
  }
  return { found: false };
}
