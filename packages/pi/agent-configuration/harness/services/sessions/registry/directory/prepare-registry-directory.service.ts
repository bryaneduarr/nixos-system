import { chmod, mkdir } from "node:fs/promises";
import { PRIVATE_DIRECTORY_MODE } from "../../../../constants/sessions/registry/registry-files.constant.ts";

export async function prepareRegistryDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: PRIVATE_DIRECTORY_MODE });
  await chmod(directory, PRIVATE_DIRECTORY_MODE);
}
