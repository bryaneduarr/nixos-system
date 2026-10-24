import type { CreateChange } from "./create-change.interface.ts";
import type { DeleteChange } from "./delete-change.interface.ts";
import type { MoveChange } from "./move-change.interface.ts";
import type { ReplaceChange } from "./replace-change.interface.ts";

/** One file operation the edit tool performs. */
export type EditChange = ReplaceChange | CreateChange | DeleteChange | MoveChange;
