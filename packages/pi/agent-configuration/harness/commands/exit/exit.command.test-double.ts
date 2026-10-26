import { installExitEvents } from "../../services/sessions/events/install-exit-events.service.ts";
import { handlerNamed } from "../../services/sessions/install/handler-named.test-double.ts";
import type { ExitCommandApi } from "../../types/sessions/exit/exit-command-api.interface.ts";
import type { ExitCommandSpec } from "../../types/sessions/exit/exit-command-spec.interface.ts";
import type { ExitContext } from "../../types/sessions/exit/exit-context.interface.ts";
import type { ExitDependencies } from "../../types/sessions/exit/exit-dependencies.interface.ts";
import type { ExitEventsApi } from "../../types/sessions/exit/exit-events-api.interface.ts";
import type { ExitShortcutSpec } from "../../types/sessions/exit/exit-shortcut-spec.interface.ts";
import type { ExitShutdownEvent } from "../../types/sessions/exit/exit-shutdown-event.interface.ts";
import { installExitCommand } from "./exit.command.ts";

type ShutdownHandler = (event: ExitShutdownEvent) => void;

export function installExit(api: ExitCommandApi & ExitEventsApi, dependencies: ExitDependencies): void {
  installExitEvents(api);
  installExitCommand(api, dependencies);
}

export function exitHarness() {
  const commands = new Map<string, ExitCommandSpec["handler"]>();
  const shortcuts = new Map<string, ExitShortcutSpec["handler"]>();
  const events = new Map<string, ShutdownHandler>();
  const notifications: string[] = [];
  const effects: string[] = [];
  let approve = false;
  let draft = "";
  let idle = true;
  let pending = false;
  let confirm = async (_title: string, text: string): Promise<boolean> => {
    effects.push(text);
    return approve;
  };
  const ctx: ExitContext = {
    mode: "tui",
    signal: undefined,
    isIdle: () => idle,
    hasPendingMessages: () => pending,
    shutdown: () => effects.push("shutdown"),
    abort: () => effects.push("abort"),
    ui: {
      getEditorText: () => draft,
      confirm: (title: string, text: string) => confirm(title, text),
      notify: (message: string) => notifications.push(message),
    },
  };
  const api: ExitCommandApi & ExitEventsApi = {
    on: (name: string, handler: ShutdownHandler) => events.set(name, handler),
    registerCommand: (name: string, spec: ExitCommandSpec) => commands.set(name, spec.handler),
    registerShortcut: (name: string, spec: ExitShortcutSpec) => shortcuts.set(name, spec.handler),
  };
  return {
    api,
    ctx,
    commands,
    shortcuts,
    events,
    notifications,
    effects,
    approve: () => {
      approve = true;
    },
    setConfirm: (replacement: typeof confirm) => {
      confirm = replacement;
    },
    activity: (text: string, busy: boolean, queued: boolean) => {
      draft = text;
      idle = !busy;
      pending = queued;
    },
    reset: () => handlerNamed(events, "session_shutdown")({ reason: "reload" }),
  };
}
