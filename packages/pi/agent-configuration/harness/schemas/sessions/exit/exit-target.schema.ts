import { Type } from "typebox";
import { EXPLICIT_EXIT_MODE } from "../../../constants/sessions/exit/exit.constant.ts";
import {
  PANE_ID_PATTERN,
  TAB_ID_PATTERN,
  WORKSPACE_ID_PATTERN,
} from "../../../constants/sessions/herdr/herdr.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../constants/sessions/registry/registry.constant.ts";

export const ExitTargetSchema = Type.Object({
  /** Marks that the target was requested by an explicit exit. */
  mode: Type.Literal(EXPLICIT_EXIT_MODE),
  /** Absolute path of the Herdr socket used to inspect and close the pane. */
  socket: Type.String({ pattern: ABSOLUTE_PATH_PATTERN.source }),
  /** Herdr pane identifier that hosts the exiting Pi process. */
  pane: Type.String({ pattern: PANE_ID_PATTERN.source }),
  /** Herdr tab identifier that contains the pane. */
  tab: Type.String({ pattern: TAB_ID_PATTERN.source }),
  /** Herdr workspace identifier that contains the tab. */
  workspace: Type.String({ pattern: WORKSPACE_ID_PATTERN.source }),
  /** Process identifier of the exiting Pi process. */
  pid: Type.Integer({ minimum: 1 }),
  /** Boot and start-time identity of the exiting Pi process. */
  processStart: Type.String(),
  /** Process identifier of the shell that owns the pane. */
  shellPid: Type.Integer({ minimum: 1 }),
  /** Boot and start-time identity of the shell that owns the pane. */
  shellStart: Type.String(),
});
