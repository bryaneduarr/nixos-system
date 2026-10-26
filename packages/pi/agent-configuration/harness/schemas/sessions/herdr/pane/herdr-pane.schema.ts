import { Type } from "typebox";
import {
  PANE_ID_PATTERN,
  TAB_ID_PATTERN,
  WORKSPACE_ID_PATTERN,
} from "../../../../constants/sessions/herdr/herdr.constant.ts";

export const HerdrPaneSchema = Type.Object({
  /** Pane identifier reported by Herdr. */
  pane_id: Type.String({ pattern: PANE_ID_PATTERN.source }),
  /** Tab identifier reported by Herdr. */
  tab_id: Type.String({ pattern: TAB_ID_PATTERN.source }),
  /** Workspace identifier reported by Herdr. */
  workspace_id: Type.String({ pattern: WORKSPACE_ID_PATTERN.source }),
});
