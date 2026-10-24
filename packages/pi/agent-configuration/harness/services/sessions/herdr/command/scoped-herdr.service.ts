import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { executeHerdr } from "./execute-herdr.service.ts";
import { socketEnvironment } from "./socket-environment.service.ts";

export function scopedHerdr(socket: string): HerdrCommand {
  const env = socketEnvironment(socket);
  return (args) => executeHerdr(args, env);
}
