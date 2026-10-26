import { Type } from "typebox";
import {
  PANE_ID_PATTERN,
  TAB_ID_PATTERN,
  WORKSPACE_ID_PATTERN,
} from "../../../../constants/sessions/herdr/herdr.constant.ts";
import {
  ABSOLUTE_PATH_PATTERN,
  SESSION_IDENTITY_PATTERN,
} from "../../../../constants/sessions/registry/registry.constant.ts";
import { SessionContextSchema } from "./session-context.schema.ts";

export const SessionStatusSchema = Type.Union([Type.Literal("working"), Type.Literal("draft"), Type.Literal("idle")]);

export const SessionRowSchema = Type.Object({
  /** Stable identifier of the Pi session, a UUID. */
  identity: Type.String({ pattern: SESSION_IDENTITY_PATTERN.source }),
  /** Operating system process identifier of the Pi process. */
  pid: Type.Integer({ minimum: 1 }),
  /** Boot and start-time identity that detects reused process identifiers. */
  processStart: Type.String(),
  /** Time of the last publication in milliseconds since the epoch. */
  updatedAt: Type.Number(),
  /** Absolute project directory of the session. */
  cwd: Type.String({ pattern: ABSOLUTE_PATH_PATTERN.source }),
  /** Herdr pane identifier that hosts the session. */
  pane: Type.String({ pattern: PANE_ID_PATTERN.source }),
  /** Herdr tab identifier that contains the pane. */
  tab: Type.String({ pattern: TAB_ID_PATTERN.source }),
  /** Herdr workspace identifier that contains the tab. */
  workspace: Type.String({ pattern: WORKSPACE_ID_PATTERN.source }),
  /** Identifier of the conversation in Pi's session manager. */
  sessionId: Type.String(),
  /** Instance name shown to the user, such as project-pi-1. */
  name: Type.String(),
  /** Git branch or detached revision of the project, or a no-git label. */
  branch: Type.String(),
  /** Context window usage reported by the session. */
  context: SessionContextSchema,
  /** Whether the session is working, has an editor draft, or is idle. */
  status: SessionStatusSchema,
  /** Whether Pi launched this session through the session manager. */
  owned: Type.Boolean(),
  /** Whether the conversation has any user or agent history. */
  historyEver: Type.Boolean(),
  /** Whether the session has no work that would be lost by closing its pane. */
  cleanupSafe: Type.Boolean(),
});
