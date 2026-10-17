import { Type } from "typebox";

export const FastModeStateSchema = Type.Object({
  enabled: Type.Boolean({ description: "Whether Codex fast mode is turned on." }),
});
