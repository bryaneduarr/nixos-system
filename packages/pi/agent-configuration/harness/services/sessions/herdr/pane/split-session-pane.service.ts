import { PI_AGENT_NAME } from "../../../../constants/sessions/herdr/herdr.constant.ts";
import {
  HERDR_AGENT_START,
  HERDR_CWD_FLAG,
  HERDR_DIRECTION_FLAG,
  HERDR_ENV_FLAG,
  HERDR_KIND_FLAG,
  HERDR_NO_FOCUS_FLAG,
  HERDR_PANE_FLAG,
  HERDR_PANE_LAYOUT,
  HERDR_PANE_RENAME,
  HERDR_PANE_SPLIT,
  HERDR_TIMEOUT_FLAG,
} from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import {
  AGENT_START_TIMEOUT_MS,
  PANE_MIN_SPLIT_RATIO,
} from "../../../../constants/sessions/herdr/herdr-timing.constant.ts";
import {
  PI_MANAGED_SESSION_VARIABLE,
  PI_SESSION_REGISTRY_VARIABLE,
} from "../../../../constants/sessions/install/environment.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { SessionPaneSplit } from "../../../../types/sessions/herdr/pane/session-pane-split.interface.ts";
import { isUnknownArray } from "../../../values/is-unknown-array.service.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { awaitSessionRegistration } from "./await-session-registration.service.ts";
import { focusSession } from "./focus-session.service.ts";
import { paneIdentity } from "./pane-identity.service.ts";

export async function splitSessionPane(split: SessionPaneSplit): Promise<void> {
  const { command, registry, cwd, source, token, name } = split;
  const env = [
    HERDR_ENV_FLAG,
    `${PI_MANAGED_SESSION_VARIABLE}=${token}`,
    HERDR_ENV_FLAG,
    `${PI_SESSION_REGISTRY_VARIABLE}=${registry.directory}`,
  ];
  const direction = await chooseSplitDirection(command, source.pane);
  const splitResponse = await command([
    ...HERDR_PANE_SPLIT,
    source.pane,
    HERDR_DIRECTION_FLAG,
    direction,
    HERDR_CWD_FLAG,
    cwd,
    ...env,
    HERDR_NO_FOCUS_FLAG,
  ]);
  const target = paneIdentity(splitResponse.pane);
  const isSibling = target.tab === source.tab && target.workspace === source.workspace && target.pane !== source.pane;
  if (!isSibling) throw new Error("Herdr did not create a sibling pane");
  await command([...HERDR_PANE_RENAME, target.pane, name]);
  await command([
    ...HERDR_AGENT_START,
    name,
    HERDR_KIND_FLAG,
    PI_AGENT_NAME,
    HERDR_PANE_FLAG,
    target.pane,
    HERDR_TIMEOUT_FLAG,
    String(AGENT_START_TIMEOUT_MS),
  ]);
  const ready = await awaitSessionRegistration({ registry, token, pane: target.pane, cwd });
  await focusSession(command, registry, ready);
}

async function chooseSplitDirection(command: HerdrCommand, pane: string): Promise<"right" | "down"> {
  const layout = readObjectValue((await command([...HERDR_PANE_LAYOUT, pane])).layout);
  const sourcePane = isUnknownArray(layout.panes)
    ? layout.panes.find((candidate) => readObjectValue(candidate).pane_id === pane)
    : undefined;
  const { width, height } = readObjectValue(readObjectValue(sourcePane).rect);
  if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0) {
    throw new Error("Herdr returned invalid pane dimensions");
  }
  return width >= height * PANE_MIN_SPLIT_RATIO ? "right" : "down";
}
