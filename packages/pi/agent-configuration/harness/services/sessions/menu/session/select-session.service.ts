import { createSessionMenuComponent } from "../../../../components/sessions/session-menu.component.ts";
import {
  OVERLAY_ANCHOR,
  OVERLAY_MARGIN,
  OVERLAY_MAX_HEIGHT,
  OVERLAY_WIDTH,
} from "../../../../constants/split-view/overlay.constant.ts";
import type { MenuSelection } from "../../../../types/sessions/menu/session/menu-selection.interface.ts";
import type { SessionMenuContext } from "../../../../types/sessions/menu/session/session-menu-context.interface.ts";
import type { SessionListing } from "../../../../types/sessions/registry/row/session-listing.interface.ts";

export function selectSession(ctx: SessionMenuContext, registry: SessionListing): Promise<MenuSelection> {
  return ctx.ui.custom((tui, theme, _keys, done) => createSessionMenuComponent({ tui, theme, registry, done }), {
    overlay: true,
    overlayOptions: {
      anchor: OVERLAY_ANCHOR,
      width: OVERLAY_WIDTH,
      maxHeight: OVERLAY_MAX_HEIGHT,
      margin: OVERLAY_MARGIN,
    },
  });
}
