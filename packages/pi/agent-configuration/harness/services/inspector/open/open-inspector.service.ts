import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { InspectorOverlay } from "../../../components/inspector/inspector-overlay.component.ts";
import { OVERLAY_MIN_WIDTH } from "../../../constants/inspector/open/inspector-overlay.constant.ts";
import {
  OVERLAY_ANCHOR,
  OVERLAY_MARGIN,
  OVERLAY_MAX_HEIGHT,
  OVERLAY_WIDTH,
} from "../../../constants/split-view/overlay.constant.ts";
import type { InspectorSelection } from "../../../types/inspector/open/inspector-selection.interface.ts";

let inspectorOpen = false;

export async function openInspector(ctx: ExtensionContext, selection: InspectorSelection): Promise<void> {
  if (inspectorOpen) return;
  inspectorOpen = true;
  try {
    await ctx.ui.custom<void>(
      (tui, theme, _keybindings, done) => new InspectorOverlay({ tui, theme, done, selection }),
      {
        overlay: true,
        overlayOptions: {
          anchor: OVERLAY_ANCHOR,
          width: OVERLAY_WIDTH,
          minWidth: OVERLAY_MIN_WIDTH,
          maxHeight: OVERLAY_MAX_HEIGHT,
          margin: OVERLAY_MARGIN,
        },
      },
    );
  } finally {
    inspectorOpen = false;
  }
}
