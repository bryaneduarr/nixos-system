import { Input } from "@earendil-works/pi-tui";
import { MENU_FILTER_PROMPT } from "../../constants/sessions/menu/menu.constant.ts";
import { SESSION_REFRESH_INTERVAL_MS } from "../../constants/sessions/monitor/monitor.constant.ts";
import { chooseSelectedSession } from "../../services/sessions/menu/session/choose-selected-session.service.ts";
import { classifyMenuKey } from "../../services/sessions/menu/session/classify-menu-key.service.ts";
import { filterSessionRows } from "../../services/sessions/menu/session/filter-session-rows.service.ts";
import { keepOrChooseSelection } from "../../services/sessions/menu/session/keep-or-choose-selection.service.ts";
import { moveSessionSelection } from "../../services/sessions/menu/session/move-session-selection.service.ts";
import { renderFilterLines } from "../../services/sessions/menu/session/render-filter-lines.service.ts";
import { renderSessionMenu } from "../../services/sessions/menu/session/render-session-menu.service.ts";
import type { ValueState } from "../../types/activity/value/value-state.interface.ts";
import type { SessionMenuComponent } from "../../types/sessions/menu/session/session-menu-component.interface.ts";
import type { SessionMenuInput } from "../../types/sessions/menu/session/session-menu-input.interface.ts";
import type { LiveSession } from "../../types/sessions/registry/row/live-session.interface.ts";

export function createSessionMenuComponent(input: SessionMenuInput): SessionMenuComponent {
  let rows: readonly LiveSession[] = [];
  let selection: ValueState<string> = { state: "absent" };
  let refreshError: ValueState<string> = { state: "absent" };
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
        selection = keepOrChooseSelection(visibleRows(), selection, process.pid);
        refreshError = { state: "absent" };
      }
    } catch (failure) {
      refreshError = { state: "present", value: String(failure) };
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
    set focused(isFocused: boolean) {
      filter.focused = isFocused && filtering;
    },
    invalidate() {
      filter.invalidate();
    },
    handleInput(data: string) {
      const action = classifyMenuKey(data, filtering);
      switch (action) {
        case "stop-filtering":
          filtering = false;
          filter.focused = false;
          break;
        case "edit-filter":
          filter.handleInput(data);
          selection = keepOrChooseSelection(visibleRows(), selection, process.pid);
          break;
        case "cancel":
          input.done("cancel");
          break;
        case "new-session":
          input.done("new");
          break;
        case "start-filtering":
          filtering = true;
          filter.focused = true;
          break;
        case "choose":
          input.done(chooseSelectedSession(visibleRows(), selection));
          break;
        case "move-selection":
          selection = moveSessionSelection(visibleRows(), selection, data);
          break;
        default:
          return action satisfies never;
      }
      input.tui.requestRender();
    },
    render(width: number) {
      const filterLines = renderFilterLines(filter, filtering, width);
      return renderSessionMenu({
        width,
        terminalRows: input.tui.terminal.rows,
        theme: input.theme,
        rows: visibleRows(),
        selection,
        pid: process.pid,
        filterLines,
        refreshError,
      });
    },
  };
}
