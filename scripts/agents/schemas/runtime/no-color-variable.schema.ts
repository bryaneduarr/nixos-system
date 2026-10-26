import { z } from "zod";

/** Value of the NO_COLOR variable; any non-empty value turns colors off. */
export const noColorVariableSchema = z.string().min(1);
