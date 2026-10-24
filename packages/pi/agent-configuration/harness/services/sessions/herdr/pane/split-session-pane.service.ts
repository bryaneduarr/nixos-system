import {
  PI_MANAGED_SESSION_VARIABLE,
  PI_SESSION_REGISTRY_VARIABLE,
} from "../../../../constants/sessions/environment.constant.ts";
import { PI_AGENT_NAME } from "../../../../constants/sessions/herdr.constant.ts";
import { AGENT_START_TIMEOUT_MS, PANE_MIN_SPLIT_RATIO } from "../../../../constants/sessions/herdr-timing.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { SessionPaneSplit } from "../../../../types/sessions/herdr/pane/session-creation.interface.ts";
import { isUnknownArray } from "../response/is-unknown-array.service.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { awaitSessionRegistration } from "./await-session-registration.service.ts";
import { focusSession } from "./focus-session.service.ts";
import { paneIdentity } from "./pane-identity.service.ts";

export async function splitSessionPane(split: SessionPaneSplit): Promise<void> {
  const { command, registry, cwd, source, token, name } = split;
  const env = [
    "--env",
    `${PI_MANAGED_SESSION_VARIABLE}=${token}`,
    "--env",
    `${PI_SESSION_REGISTRY_VARIABLE}=${registry.directory}`,
  ];
  const direction = await chooseSplitDirection(command, source.pane);
  const splitResponse = await command([
    "pane",
    "split",
    "--pane",
    source.pane,
    "--direction",
    direction,
    "--cwd",
    cwd,
    ...env,
    "--no-focus",
  ]);
  const target = paneIdentity(splitResponse.pane);
  const isSibling = target.tab === source.tab && target.workspace === source.workspace && target.pane !== source.pane;
  if (!isSibling) throw new Error("Herdr did not create a sibling pane");
  await command(["pane", "rename", target.pane, name]);
  await command([
    "agent",
    "start",
    name,
    "--kind",
    PI_AGENT_NAME,
    "--pane",
    target.pane,
    "--timeout",
    String(AGENT_START_TIMEOUT_MS),
  ]);
  const ready = await awaitSessionRegistration(registry, token, target.pane, cwd);
  await focusSession(command, registry, ready);
}

async function chooseSplitDirection(command: HerdrCommand, pane: string): Promise<"right" | "down"> {
  const layout = readObjectValue((await command(["pane", "layout", "--pane", pane])).layout);
  const sourcePane = isUnknownArray(layout.panes)
    ? layout.panes.find((candidate) => readObjectValue(candidate).pane_id === pane)
    : undefined;
  const { width, height } = readObjectValue(readObjectValue(sourcePane).rect);
  if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0) {
    throw new Error("Herdr returned invalid pane dimensions");
  }
  return width >= height * PANE_MIN_SPLIT_RATIO ? "right" : "down";
}
