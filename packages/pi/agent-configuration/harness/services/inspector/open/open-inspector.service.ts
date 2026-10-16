import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { ActivityInspector } from "../../../components/inspector/inspector-overlay.component.ts";
import type { InspectorSelection } from "../../../types/inspector/selection/inspector-selection.interface.ts";

let inspectorOpen = false;

export async function openInspector(ctx: ExtensionContext, selection: InspectorSelection): Promise<void> {
  if (inspectorOpen) return;
  inspectorOpen = true;
  try {
    await ctx.ui.custom<void>(
      (tui, theme, _keybindings, done) => new ActivityInspector({ tui, theme, done, selection }),
      {
        overlay: true,
        overlayOptions: {
          anchor: "center",
          width: "92%",
          minWidth: 56,
          maxHeight: "88%",
          margin: 1,
        },
      },
    );
  } finally {
    inspectorOpen = false;
  }
}
