import type { Static } from "typebox";
import type {
  SessionRowSchema,
  SessionStatusSchema,
} from "../../../../schemas/sessions/registry/row/session-row.schema.ts";

/** Live record that one running Pi session publishes to the registry. */
export type LiveSession = Static<typeof SessionRowSchema>;

/** Activity state of a live Pi session. */
export type SessionStatus = Static<typeof SessionStatusSchema>;
