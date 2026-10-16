import { Type } from "typebox";

export const RunParamsSchema = Type.Object({
  command: Type.String({ description: "Shell command to execute." }),
  timeoutMs: Type.Optional(
    Type.Integer({
      minimum: 1,
      description: "Timeout in milliseconds. Defaults to 120000.",
    }),
  ),
});
