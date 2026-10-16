import { ARTIFACT_PATTERNS } from "../../../constants/activity/artifact-pattern.constant.ts";
import type { ArtifactPathLookup } from "../../../types/activity/artifact-path.interface.ts";

export function findArtifactPath(text: string): ArtifactPathLookup {
  for (const pattern of ARTIFACT_PATTERNS) {
    const path = pattern.exec(text)?.[1];
    if (path) return { found: true, path };
  }
  return { found: false };
}
