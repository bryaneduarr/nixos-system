import { Type } from "typebox";

export const RawRunArgumentsSchema = Type.Object({
  /** Shell command as the model sent it. */
  command: Type.Optional(Type.String()),
  /** Shell command under the key some models send instead of command. */
  run: Type.Optional(Type.String()),
  /** Directory the command starts in. */
  cwd: Type.Optional(Type.String()),
  /** Milliseconds before the command is killed. */
  timeoutMs: Type.Optional(Type.Integer({ minimum: 1 })),
});
