import type { ExitShutdownEvent } from "./exit-shutdown-event.interface.ts";

/** Pi event registration that the explicit exit uses to clear its state on shutdown. */
export interface ExitEventsApi {
  /** Subscribes to the session shutdown event. */
  readonly on: (event: "session_shutdown", handler: (event: ExitShutdownEvent) => void) => unknown;
}
