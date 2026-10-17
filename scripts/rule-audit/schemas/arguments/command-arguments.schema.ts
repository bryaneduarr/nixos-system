import { z } from "zod";

export const commandArgumentsSchema = z.union([
  z.tuple([
    /** Directory of the TypeScript project to audit. */
    z.string().min(1),
  ]),
  z.tuple([
    /** Directory of the TypeScript project to audit. */
    z.string().min(1),
    /** Markdown rule file whose exceptions table lists allowed findings. */
    z.string().min(1),
  ]),
]);
