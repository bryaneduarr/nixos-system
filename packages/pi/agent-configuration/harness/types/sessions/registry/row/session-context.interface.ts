import type { Static } from "typebox";
import type { SessionContextSchema } from "../../../../schemas/sessions/registry/row/session-context.schema.ts";

/** Context window usage of a live Pi session, with every absence modeled as a variant. */
export type SessionContext = Static<typeof SessionContextSchema>;
