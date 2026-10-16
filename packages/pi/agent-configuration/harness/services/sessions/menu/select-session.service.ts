import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createSessionMenuComponent } from "../../../components/sessions/session-menu.component.ts";
import type { MenuSelection } from "../../../types/sessions/menu/menu-selection.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";

export function selectSession(ctx: ExtensionContext, registry: SessionRegistry): Promise<MenuSelection> {
  return ctx.ui.custom<MenuSelection>(
    (tui, theme, _keys, done) => createSessionMenuComponent({ tui, theme, registry, done }),
    { overlay: true, overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 } },
  );
}
