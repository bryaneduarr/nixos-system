import { z } from "zod";

/** Home directory path read from the HOME environment variable, which must not be empty. */
export const homeDirectorySchema = z.string().min(1);
