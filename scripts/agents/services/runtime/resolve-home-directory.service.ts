import { homeDirectorySchema } from "../../schemas/runtime/home-directory.schema.ts";

export function resolveHomeDirectory(homeVariable: unknown, fallbackHomeDirectory: string): string {
  const parsedHome = homeDirectorySchema.safeParse(homeVariable);
  return parsedHome.success ? parsedHome.data : fallbackHomeDirectory;
}
