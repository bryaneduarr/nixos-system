import { PI_AGENT_NAME, PI_HARNESS_SOURCE } from "../../../constants/sessions/herdr/herdr.constant.ts";
import {
  HERDR_AGENT_FLAG,
  HERDR_BODY_FLAG,
  HERDR_NOTIFICATION_SHOW,
  HERDR_PANE_CURRENT,
  HERDR_PANE_RELEASE_AGENT,
  HERDR_SEQUENCE_FLAG,
  HERDR_SOUND_FLAG,
  HERDR_SOURCE_FLAG,
} from "../../../constants/sessions/herdr/herdr-command.constant.ts";
import {
  COMPLETION_NOTIFICATION_SOUND,
  COMPLETION_NOTIFICATION_TITLE,
} from "../../../constants/sessions/herdr/herdr-timing.constant.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { HerdrSessions } from "../../../types/sessions/herdr/herdr-sessions.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/row/session-registry.interface.ts";
import { executeHerdr } from "./command/execute-herdr.service.ts";
import { createSessionPane } from "./pane/create-session-pane.service.ts";
import { focusSession } from "./pane/focus-session.service.ts";
import { nameHerdrPane } from "./pane/name-herdr-pane.service.ts";
import { paneIdentity } from "./pane/pane-identity.service.ts";
import { reportSessionState } from "./pane/report-session-state.service.ts";

const defaultHerdrCommand: HerdrCommand = (args) => executeHerdr(args, process.env);

export function createHerdrSessions(
  registry: SessionRegistry,
  command: HerdrCommand = defaultHerdrCommand,
): HerdrSessions {
  let reportSequence = Date.now() * 1000;
  const nextSequence = (): string => String(++reportSequence);
  return {
    current: async () => paneIdentity((await command(HERDR_PANE_CURRENT)).pane),
    report: (row, source) => reportSessionState({ command, nextSequence, row, source }),
    notifyCompletion: async (name) => {
      await command([
        ...HERDR_NOTIFICATION_SHOW,
        COMPLETION_NOTIFICATION_TITLE,
        HERDR_BODY_FLAG,
        name,
        HERDR_SOUND_FLAG,
        COMPLETION_NOTIFICATION_SOUND,
      ]);
    },
    release: async (row) => {
      await command([
        ...HERDR_PANE_RELEASE_AGENT,
        row.pane,
        HERDR_SOURCE_FLAG,
        PI_HARNESS_SOURCE,
        HERDR_AGENT_FLAG,
        PI_AGENT_NAME,
        HERDR_SEQUENCE_FLAG,
        nextSequence(),
      ]);
    },
    focus: (row) => focusSession(command, registry, row),
    name: (location, name) => nameHerdrPane(command, location, name),
    create: (cwd, source) => createSessionPane({ command, registry, cwd, source }),
  };
}
