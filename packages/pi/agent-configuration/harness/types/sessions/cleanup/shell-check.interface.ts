/** Shell that must still own the pane when an explicit exit closes it. */
interface ExitShellCheck {
  /** Marks that the shell identity must be verified before closing. */
  readonly required: true;
  /** Process identifier of the shell that owns the pane. */
  readonly pid: number;
  /** Boot and start-time identity of the shell. */
  readonly start: string;
}

/** No shell identity is required before closing the pane. */
interface NoShellCheck {
  /** Marks that no shell identity must be verified. */
  readonly required: false;
}

/** Whether closing a pane must verify the shell that owns it. */
export type ShellCheck = ExitShellCheck | NoShellCheck;
