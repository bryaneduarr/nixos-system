import {
  HERDR_PANE_GET,
  HERDR_PANE_PROCESS_INFO,
  HERDR_TAB_GET,
} from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import type { PaneInspection } from "../../../../types/sessions/cleanup/pane/pane-inspection.interface.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";

export async function inspectPane(target: PaneCloseTarget, command: HerdrCommand): Promise<PaneInspection> {
  const tab = (await command([...HERDR_TAB_GET, target.tab])).tab;
  const pane = (await command([...HERDR_PANE_GET, target.pane])).pane;
  const processInfo = (await command([...HERDR_PANE_PROCESS_INFO, target.pane])).process_info;
  return { tab, pane, processInfo };
}
