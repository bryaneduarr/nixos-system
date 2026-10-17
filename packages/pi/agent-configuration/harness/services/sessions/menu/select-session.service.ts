import { createSessionMenuComponent } from "../../../components/sessions/session-menu.component.ts";
import type { MenuSelection } from "../../../types/sessions/menu/menu-selection.interface.ts";
import type { SessionMenuContext } from "../../../types/sessions/menu/session-menu-context.interface.ts";
import type { SessionListing } from "../../../types/sessions/registry/session-listing.interface.ts";

export function selectSession(ctx: SessionMenuContext, registry: SessionListing): Promise<MenuSelection> {
  return ctx.ui.custom((tui, theme, _keys, done) => createSessionMenuComponent({ tui, theme, registry, done }), {
    overlay: true,
    overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 },
  });
}
