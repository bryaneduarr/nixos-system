import type { LiveSession } from "../../registry/row/live-session.interface.ts";

/** Result of the session menu: a live session to focus, a request for a new session, or cancellation. */
export type MenuSelection = LiveSession | "new" | "cancel";
