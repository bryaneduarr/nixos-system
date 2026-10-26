import type { EDIT_OPERATIONS } from "../../../constants/tools/edit/edit-operations.constant.ts";

/** File change the edit tool performs. */
export type EditOperation = (typeof EDIT_OPERATIONS)[number];
