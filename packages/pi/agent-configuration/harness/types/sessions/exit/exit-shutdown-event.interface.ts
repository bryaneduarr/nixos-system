/** Session shutdown event as far as the explicit exit reads it. */
export interface ExitShutdownEvent {
  /** Why the session shuts down, such as a quit or a reload. */
  readonly reason: string;
}
