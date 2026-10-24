import { Type } from "typebox";

/** Arguments of a codemode call; the call is still streaming while `code` is missing. */
export const CodemodeArgumentsSchema = Type.Object({
  /** JavaScript source of the script. */
  code: Type.String(),
});
