/** Result of searching tool output for a saved full-output artifact path. */
export type ArtifactPathLookup = { readonly found: true; readonly path: string } | { readonly found: false };
