import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { executeHerdr } from "./execute-herdr.service.ts";

export function scopedHerdr(socket: string): HerdrCommand {
  const env = { ...process.env, HERDR_SOCKET_PATH: socket, HERDR_API_SOCKET: socket };
  return (args) => executeHerdr(args, env);
}
