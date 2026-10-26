import {
  HERDR_API_SOCKET_VARIABLE,
  HERDR_SOCKET_PATH_VARIABLE,
} from "../../../../constants/sessions/install/environment.constant.ts";

export function socketEnvironment(socket: string): NodeJS.ProcessEnv {
  return { ...process.env, [HERDR_SOCKET_PATH_VARIABLE]: socket, [HERDR_API_SOCKET_VARIABLE]: socket };
}
