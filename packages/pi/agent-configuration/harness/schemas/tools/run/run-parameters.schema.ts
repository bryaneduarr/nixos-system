import { Type } from "typebox";
import { DEFAULT_RUN_TIMEOUT_MS } from "../../../constants/tools/run/run-limits.constant.ts";

export const RunParamsSchema = Type.Object({
  /** Shell command to execute. */
  command: Type.String({ description: "Shell command to execute. Do not start it with `cd`; use cwd instead." }),
  /** Directory the command starts in, relative to the session directory. Created when missing. */
  cwd: Type.Optional(
    Type.String({
      description:
        "Directory to run in, absolute or relative to the session directory. Defaults to the session directory and is created when missing.",
    }),
  ),
  /** Milliseconds before the command is killed. */
  timeoutMs: Type.Optional(
    Type.Integer({
      minimum: 1,
      description: `Timeout in milliseconds. Defaults to ${DEFAULT_RUN_TIMEOUT_MS}.`,
    }),
  ),
});
