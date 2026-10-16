import type { Static } from "typebox";
import type { ExitTargetSchema } from "../../../schemas/sessions/exit/exit-target.schema.ts";

/** Pane and process identities captured when an explicit exit is requested. */
export type ExitTarget = Static<typeof ExitTargetSchema>;
