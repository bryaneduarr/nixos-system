import { ARTIFACT_PATTERNS } from "../../../constants/activity/artifact-pattern.constant.ts";
import type { ArtifactPathLookup } from "../../../types/activity/artifact-path.interface.ts";

export function findArtifactPath(text: string): ArtifactPathLookup {
  for (const pattern of ARTIFACT_PATTERNS) {
    const match = pattern.exec(text);
    if (match === null) continue;
    const [, path] = match;
    if (path) return { found: true, path };
  }
  return { found: false };
}
