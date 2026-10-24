import type { EditRequest } from "../../../../types/tools/edit/edit-request.interface.ts";
import type { EditResult } from "../../../../types/tools/edit/edit-result.interface.ts";
import { resolveToolPath } from "../../path/resolve-tool-path.service.ts";
import { withPathLock } from "../../path/with-path-lock.service.ts";
import { createFile } from "./create-file.service.ts";
import { deleteFile } from "./delete-file.service.ts";
import { moveFile } from "./move-file.service.ts";
import { replaceFile } from "./replace-file.service.ts";

export async function editFile(request: EditRequest): Promise<EditResult> {
  const { cwd, change } = request;
  const target = resolveToolPath(cwd, change.path);

  return withPathLock(target, () => {
    if (change.op === "create") return createFile(change, target);
    if (change.op === "delete") return deleteFile(change, target);
    if (change.op === "move") return moveFile(cwd, change, target);
    return replaceFile(change, target);
  });
}
