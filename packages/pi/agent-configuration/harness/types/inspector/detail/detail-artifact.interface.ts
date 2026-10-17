/** Artifact text that replaces the tool result in the detail pane. */
interface LoadedArtifact {
  /** Discriminates a loaded artifact from the tool result. */
  readonly kind: "loaded";
  /** Content of the artifact file. */
  readonly text: string;
}

/** The detail pane shows the tool result of the selected call. */
interface ToolResultView {
  /** Discriminates the tool result from a loaded artifact. */
  readonly kind: "tool-result";
}

/** Text the detail pane shows for the selected call. */
export type DetailArtifact = LoadedArtifact | ToolResultView;
