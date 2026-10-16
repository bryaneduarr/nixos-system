import { z } from "zod";

export const commandArgumentsSchema = z.tuple([
  /* Directory of the TypeScript project to audit. */
  z.string().min(1),
]);
