import { Type } from "typebox";
import { ABSOLUTE_PATH_PATTERN } from "../../../../constants/sessions/registry/registry.constant.ts";
import { ExitTargetSchema } from "../../exit/exit-target.schema.ts";
import { SessionRowSchema } from "../../registry/row/session-row.schema.ts";

const CleanupSocketSchema = Type.Object({
  /** Absolute path of the Herdr socket used to inspect and close the pane. */
  socket: Type.String({ pattern: ABSOLUTE_PATH_PATTERN.source }),
});

export const CleanupWorkerPayloadSchema = Type.Union([
  ExitTargetSchema,
  Type.Intersect([SessionRowSchema, CleanupSocketSchema]),
]);
