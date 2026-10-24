import { Type } from "typebox";
import {
  PROJECT_NAME_PATTERN,
  SESSION_IDENTITY_PATTERN,
} from "../../../../constants/sessions/registry/registry.constant.ts";

export const NameReservationSchema = Type.Object({
  /** Session identity that holds the reserved name. */
  identity: Type.String({ pattern: SESSION_IDENTITY_PATTERN.source }),
  /** Sanitized project name used as the name prefix. */
  project: Type.String({ pattern: PROJECT_NAME_PATTERN.source }),
  /** Monotonic position that orders reservations within a project. */
  order: Type.Integer(),
  /** Time of the last reservation update in milliseconds since the epoch. */
  updatedAt: Type.Number(),
  /** Process identifier that holds the reservation. */
  pid: Type.Integer({ minimum: 1 }),
  /** Boot and start-time identity of the reserving process. */
  processStart: Type.String(),
});
