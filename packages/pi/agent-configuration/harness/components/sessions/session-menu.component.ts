import { Input, matchesKey } from "@earendil-works/pi-tui";
import { MENU_FILTER_PROMPT } from "../../constants/sessions/menu.constant.ts";
import { SESSION_REFRESH_INTERVAL_MS } from "../../constants/sessions/monitor.constant.ts";
import { filterSessionRows } from "../../services/sessions/menu/filter-session-rows.service.ts";
import { keepOrChooseSelection } from "../../services/sessions/menu/keep-or-choose-selection.service.ts";
import { moveSessionSelection } from "../../services/sessions/menu/move-session-selection.service.ts";
import { renderSessionMenu } from "../../services/sessions/menu/render-session-menu.service.ts";
import type { SessionMenuComponent } from "../../types/sessions/menu/session-menu-component.interface.ts";
import type { SessionMenuInput } from "../../types/sessions/menu/session-menu-input.interface.ts";
import type { LiveSession } from "../../types/sessions/registry/live-session.interface.ts";

const MENU_FILTER_RENDER_MARGIN = 4;

export function createSessionMenuComponent(input: SessionMenuInput): SessionMenuComponent {
  let rows: readonly LiveSession[] = [];
  let selectedId = "";
  let error = "";
  let refreshing = false;
  let disposed = false;
  let filtering = false;
  const filter = new Input({ prompt: MENU_FILTER_PROMPT });
  const visibleRows = (): LiveSession[] => filterSessionRows(rows, filter.getValue());
  const refresh = async (): Promise<void> => {
    if (refreshing || disposed) return;
    refreshing = true;
    try {
      const updated = await input.registry.list();
      if (!disposed) {
        rows = updated;
        selectedId = keepOrChooseSelection(visibleRows(), selectedId, process.pid);
        error = "";
      }
    } catch (failure) {
      error = String(failure);
    } finally {
      refreshing = false;
      if (!disposed) input.tui.requestRender();
    }
  };
  void refresh();
  const timer = setInterval(() => void refresh(), SESSION_REFRESH_INTERVAL_MS);
  return {
    dispose() {
      disposed = true;
      clearInterval(timer);
    },
    get focused() {
      return filter.focused;
    },
    set focused(value: boolean) {
      filter.focused = value && filtering;
    },
    invalidate() {
      filter.invalidate();
    },
    handleInput(data: string) {
      if (filtering) {
        if (matchesKey(data, "escape") || matchesKey(data, "enter")) {
          filtering = false;
          filter.focused = false;
        } else {
          filter.handleInput(data);
          selectedId = keepOrChooseSelection(visibleRows(), selectedId, process.pid);
        }
      } else if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
        input.done("cancel");
      } else if (data === "n" || data === "N") {
        input.done("new");
      } else if (matchesKey(data, "i")) {
        filtering = true;
        filter.focused = true;
      } else if (matchesKey(data, "enter")) {
        input.done(visibleRows().find((row) => row.identity === selectedId) ?? "cancel");
      } else {
        selectedId = moveSessionSelection(visibleRows(), selectedId, data);
      }
      input.tui.requestRender();
    },
    render(width: number) {
      const filterLines =
        filtering || filter.getValue() ? filter.render(Math.max(1, width - MENU_FILTER_RENDER_MARGIN)) : [];
      return renderSessionMenu({
        width,
        terminalRows: input.tui.terminal.rows,
        theme: input.theme,
        rows: visibleRows(),
        selectedId,
        pid: process.pid,
        filterLines,
        error,
      });
    },
  };
}
