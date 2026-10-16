import { PI_AGENT_NAME, PI_HARNESS_SOURCE } from "../../../constants/sessions/herdr.constant.ts";
import {
  COMPLETION_NOTIFICATION_SOUND,
  COMPLETION_NOTIFICATION_TITLE,
} from "../../../constants/sessions/herdr-timing.constant.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { HerdrSessions } from "../../../types/sessions/herdr/herdr-sessions.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { createSessionPane } from "./create-session-pane.service.ts";
import { executeHerdr } from "./execute-herdr.service.ts";
import { focusSession } from "./focus-session.service.ts";
import { nameHerdrPane } from "./name-herdr-pane.service.ts";
import { paneIdentity } from "./pane-identity.service.ts";
import { reportSessionState } from "./report-session-state.service.ts";

const defaultHerdrCommand: HerdrCommand = (args) => executeHerdr(args, process.env);

export function createHerdrSessions(
  registry: SessionRegistry,
  command: HerdrCommand = defaultHerdrCommand,
): HerdrSessions {
  let reportSequence = Date.now() * 1000;
  const nextSequence = (): string => String(++reportSequence);
  return {
    current: async () => paneIdentity((await command(["pane", "current", "--current"])).pane),
    report: (row, source) => reportSessionState(command, nextSequence, row, source),
    notifyCompletion: async (name) => {
      await command([
        "notification",
        "show",
        COMPLETION_NOTIFICATION_TITLE,
        "--body",
        name,
        "--sound",
        COMPLETION_NOTIFICATION_SOUND,
      ]);
    },
    release: async (row) => {
      await command([
        "pane",
        "release-agent",
        row.pane,
        "--source",
        PI_HARNESS_SOURCE,
        "--agent",
        PI_AGENT_NAME,
        "--seq",
        nextSequence(),
      ]);
    },
    focus: (row) => focusSession(command, registry, row),
    name: (location, name) => nameHerdrPane(command, location, name),
    create: (cwd, source) => createSessionPane({ command, registry, cwd, source }),
  };
}
