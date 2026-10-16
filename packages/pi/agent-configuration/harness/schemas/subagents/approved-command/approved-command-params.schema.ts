import { Type } from "typebox";

export const ApprovedCommandParams = Type.Object({
  /** Command text that must exactly match an approved verification command. */
  command: Type.String({
    minLength: 1,
    description: "An exact command from the parent-approved list.",
  }),
});
