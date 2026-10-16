/** Lines in tool output that name a saved full-output artifact, with the path captured in group one. */
export const ARTIFACT_PATTERNS = [/^\s*Full output:\s*(\S+)\s*$/m, /^\s*artifact:\s*(\S+)\s*$/m] as const;
